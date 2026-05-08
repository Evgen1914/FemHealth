'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp, type AuthState } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const initialState: AuthState = {};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [consentChecked, setConsentChecked] = useState(false);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-primary">FemHealth</h1>
          <p className="mt-2 text-sm text-muted-foreground">Создать аккаунт</p>
        </div>

        {/* Выбор роли */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              role === 'patient'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Я пациентка
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              role === 'doctor'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            Я врач
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="role" value={role} />

          {role === 'doctor' && (
            <div className="space-y-1.5">
              <Label htmlFor="full_name">ФИО</Label>
              <Input id="full_name" name="full_name" placeholder="Иванова Елена Петровна" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="anna@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Минимум 8 символов"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {/* Согласие 152-ФЗ — обязательное, не предзаполнено */}
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent"
              name="consent"
              value="yes"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
            />
            <Label htmlFor="consent" className="text-xs leading-tight text-muted-foreground">
              Даю согласие на обработку персональных данных, включая данные о здоровье, в
              соответствии с{' '}
              <span className="text-foreground underline">Политикой конфиденциальности</span> и
              требованиями 152-ФЗ.
            </Label>
          </div>

          {state.error && (
            <div className="rounded-lg bg-danger-bg px-3 py-2 text-xs text-destructive">
              {state.error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending || !consentChecked}>
            {pending ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-primary underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
