"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/actions/auth";
import { LogIn, Mail, Lock, User } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null);
    const result = await signIn(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div>
      {/* Avatar icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-receipt-gold/12 flex items-center justify-center">
          <User className="h-10 w-10 text-receipt-brown/60" />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-ink">Otomakbuz'a Hoş Geldin!</h2>
        <p className="text-ink-muted mt-1.5 text-sm">Giriş yapmak için bilgilerinizi girin</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-ink font-medium text-sm">E-posta</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required
              className="h-12 pl-10 bg-surface border-paper-lines" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-ink font-medium text-sm">Şifre</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
            <Input id="password" name="password" type="password" placeholder="••••••••" required
              className="h-12 pl-10 bg-surface border-paper-lines" />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 bg-receipt-brown hover:bg-receipt-brown-dark shadow-sm font-semibold text-base text-white" disabled={loading}>
          <LogIn className="h-4 w-4 mr-2" />
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-paper-lines flex items-center justify-center gap-3">
        <span className="text-sm text-ink-muted">Hesabınız yok mu?</span>
        <Link href="/kayit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded border border-paper-lines text-sm font-medium text-receipt-brown hover:bg-receipt-gold/5 transition-colors">
          Ücretsiz Kayıt Ol
        </Link>
      </div>
    </div>
  );
}
