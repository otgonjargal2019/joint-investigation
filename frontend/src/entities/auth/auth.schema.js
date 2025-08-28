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

const withPasswordConfirm = (schema) =>
  schema.superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        path: ["passwordConfirm"],
        message: "Passwords do not match. Please try again.",
        code: "custom",
      });
    }

    const fullEmail = `${data.email}@${data.email2}`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(fullEmail)) {
      ctx.addIssue({
        path: ["email"], 
        message: "Invalid email address",
        code: "custom",
      });
    }
  });

export const registerFormSchema = withPasswordConfirm(
  z.object({
    loginId: z.string().min(1, "Required"),
    password: z.string().min(1, "Required"), //passwordField,
    passwordConfirm: z.string().min(1, "Required"),
    nameKr: z.string().min(3,"Required"),
    nameEn: z.string().optional(),
    country: z.string().min(3,"Required"),
    phone1: z.string().optional(),
    phone2: z.string().optional(),
    department1: z.string().optional(),
    department2: z.string().optional(),
    email: z.string().min(1,"Required"),
    email2: z.string().min(1,"Required")
  })
);

