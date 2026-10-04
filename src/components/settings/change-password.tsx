"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/hooks/settings/use-settings";

const ChangePassword = () => {
  const { register, errors, loading, onChangePassword } = useChangePassword();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Contraseña</CardTitle>
        <CardDescription>Si entrás con Google, no necesitás una contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onChangePassword} className="flex max-w-md flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña nueva</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p role="alert" className="text-sm text-destructive">{String(errors.password.message)}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Repetí la contraseña</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p role="alert" className="text-sm text-destructive">{String(errors.confirmPassword.message)}</p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="self-start">
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
