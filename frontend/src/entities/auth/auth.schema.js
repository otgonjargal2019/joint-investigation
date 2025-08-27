import { z } from "zod";

const passwordField = z
  .string()
  .refine((val) => val.length >= 12 && val.length <= 24, {
    message: "Password must be between 12 and 24 characters long.",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must include at least one uppercase letter.",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must include at least one lowercase letter.",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must include at least one number.",
  })
  .refine((val) => /[@$!%*?&]/.test(val), {
    message: "Password must include at least one special character (@$!%*?&).",
  });


export const loginFormSchema = z.object({
  loginId: z.string().min(1, "Login ID is required"),
  password: z.string().min(1, "Password is required"), //passwordField,
});

