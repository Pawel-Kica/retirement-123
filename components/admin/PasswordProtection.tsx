/**
 * PasswordProtection Component - Simple password gate for admin
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/shared/Card';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Nieprawidłowe hasło');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-zus-navy mb-6 text-center">
          Panel Administratora
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            placeholder="Wprowadź hasło administratora"
            required
          />
          <Button type="submit" variant="navy" className="w-full">
            Zaloguj
          </Button>
        </form>
        <p className="text-xs text-zus-gray mt-4 text-center">
          Ta strona jest dostępna tylko dla administratorów systemu
        </p>
      </Card>
    </div>
  );
}
