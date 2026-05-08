'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn, type AuthState } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-medium text-primary">FemHealth</h1>
          <p className="mt-2 text-sm text-muted-foreground">Вход в аккаунт</p>
        </div>

        <form action={formAction} className="space-y-4">
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
              placeholder="Введите пароль"
              required
              autoComplete="current-password"
            />
          </div>

          {state.error && (
            <div className="rounded-lg bg-danger-bg px-3 py-2 text-xs text-destructive">
              {state.error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Вход...' : 'Войти'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-primary underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
