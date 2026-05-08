'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = {
  error?: string;
};

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const consent = formData.get('consent');

  if (!email || !password || !role) {
    return { error: 'Заполните все обязательные поля.' };
  }

  if (!consent) {
    return { error: 'Необходимо дать согласие на обработку персональных данных.' };
  }

  if (password.length < 8) {
    return { error: 'Пароль должен содержать минимум 8 символов.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Этот email уже зарегистрирован.' };
    }
    return { error: `Ошибка регистрации: ${error.message}` };
  }

  if (!data.user) {
    return { error: 'Не удалось создать пользователя.' };
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    role: role as 'patient' | 'doctor',
    email,
  });

  if (profileError) {
    return { error: `Ошибка создания профиля: ${profileError.message}` };
  }

  if (role === 'patient') {
    await supabase.from('patient_profiles').insert({ user_id: data.user.id });
  } else {
    const fullName = formData.get('full_name') as string;
    await supabase.from('doctor_profiles').insert({
      user_id: data.user.id,
      full_name: fullName || 'Врач',
    });
  }

  await supabase.from('consents').insert({
    user_id: data.user.id,
    type: 'pdn',
    version: '1.0',
    accepted: true,
  });

  await supabase.from('subscriptions').insert({
    user_id: data.user.id,
    plan: 'free',
    status: 'active',
  });

  redirect('/dashboard');
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Введите email и пароль.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Неверный email или пароль.' };
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
