import { ZodType, z } from "zod";

export type ChangePasswordProps = {
  password: string;
  confirmPassword: string;
};

export const ChangePasswordSchema: ZodType<ChangePasswordProps> = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña tiene que tener al menos 8 caracteres." })
      .max(64, {
        message: "La contraseña puede tener hasta 64 caracteres.",
      }),
    confirmPassword: z.string(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
