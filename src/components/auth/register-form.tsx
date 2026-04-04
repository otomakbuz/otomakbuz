"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/actions/auth";
import { UserPlus } from "lucide-react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null);
    const result = await signUp(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink">Hesap oluşturun</h2>
        <p className="text-ink-muted mt-1">Ücretsiz başlayın, kredi kartı gerekmez</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-ink font-medium">Ad Soyad</Label>
          <Input id="full_name" name="full_name" type="text" placeholder="Ahmet Yilmaz" required
            className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-ink font-medium">E-posta</Label>
          <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required
            className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-ink font-medium">Şifre</Label>
          <Input id="password" name="password" type="password" placeholder="En az 6 karakter" minLength={6} required
            className="h-11" />
        </div>

        <Button type="submit" className="w-full h-11 bg-receipt-brown hover:bg-receipt-brown-dark shadow-sm font-medium text-base text-white" disabled={loading}>
          <UserPlus className="h-4 w-4 mr-2" />
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </Button>
      </form>

      <p className="text-sm text-ink-muted text-center mt-6">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="text-brand font-medium hover:text-brand-dark transition-colors">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
