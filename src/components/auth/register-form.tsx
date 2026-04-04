"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null);
    const result = await signUp(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-center">Kayit Ol</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="full_name">Ad Soyad</Label>
            <Input id="full_name" name="full_name" type="text" placeholder="Ahmet Yilmaz" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Sifre</Label>
            <Input id="password" name="password" type="password" placeholder="En az 6 karakter" minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kayit yapiliyor..." : "Kayit Ol"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">Zaten hesabiniz var mi?{" "}
          <Link href="/giris" className="text-blue-600 hover:underline">Giris Yap</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
