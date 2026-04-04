"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true); setError(null);
    const result = await signIn(formData);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-center">Giris Yap</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="ornek@sirket.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Sifre</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giris yapiliyor..." : "Giris Yap"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-slate-600">Hesabiniz yok mu?{" "}
          <Link href="/kayit" className="text-blue-600 hover:underline">Kayit Ol</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
