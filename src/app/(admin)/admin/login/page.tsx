"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/actions/admin-auth";
import { Input, Label } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const params = useSearchParams();
  const [state, action] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <form
        action={action}
        className="w-full max-w-sm rounded-[var(--radius-lg)] border border-line bg-paper p-6 shadow-[var(--shadow-md)]"
      >
        <p className="font-display text-xl font-extrabold">
          MONOR<span className="text-brand"> ADMIN</span>
        </p>
        <p className="mt-1 text-sm text-muted">تسجيل الدخول إلى لوحة التحكم</p>

        <input type="hidden" name="next" value={params.get("next") ?? "/admin"} />

        <div className="mt-5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div className="mt-3">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && (
          <p className="mt-3 rounded-[var(--radius)] bg-sale-soft px-3 py-2 text-sm text-sale">
            {state.error === "locked"
              ? "تم قفل الحساب مؤقتاً بسبب محاولات فاشلة. حاول لاحقاً."
              : "بيانات الدخول غير صحيحة."}
          </p>
        )}

        <SubmitBtn />
      </form>
    </div>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-5 w-full" size="lg" disabled={pending}>
      {pending ? "جاري الدخول…" : "دخول"}
    </Button>
  );
}
