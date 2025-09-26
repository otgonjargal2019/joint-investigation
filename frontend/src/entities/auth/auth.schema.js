import { z } from "zod";

const passwordField = z
  .string()
  .refine((val) => val.length >= 8 && val.length <= 16, {
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
  password: passwordField,
  stayLoggedIn: z.boolean().optional().default(true),
});

const withChangePassConfirm = (schema) =>
  schema.superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Passwords do not match. Please try again.",
        code: "custom",
      });
    }
  });

export const changePassFormSchema = withChangePassConfirm(
  z.object({
    password: passwordField,
    newPassword: passwordField,
    confirmPassword: passwordField,
  })
);

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
  z
    .object({
      loginId: z
        .string()
        .min(1, "Required")
        .regex(
          /^[A-Za-z0-9]+$/,
          "Login ID는 영어 문자와 숫자를 포함해야 합니다."
        ),
      password: passwordField,
      passwordConfirm: z.string().min(1, "Required"),
      nameKr: z.string().optional(),
      nameEn: z.string().optional(),
      countryId: z.string().min(1, "Required"),
      headquarterId: z.string().min(1, "Required"),
      departmentId: z.string().min(1, "Required"),
      phone1: z.string().optional(),
      phone2: z.coerce.number().int().min(3, "Required"),
      email: z.string().min(1, "Required"),
      email2: z.string().min(1, "Required"),
    })
    .superRefine((data, ctx) => {
      if (!data.nameKr && !data.nameEn) {
        ctx.addIssue({
          code: "custom",
          message: "한국어 이름 또는 영어 이름이 필요합니다.",
          path: ["nameEn"],
        });
      }
    })
);

export const profileFormSchema = withPasswordConfirm(
  z.object({
    phone1: z.string().optional(),
    phone2: z.coerce.number().int().min(3, "Required"),
    email: z.string().min(1, "Required"),
    email2: z.string().min(1, "Required"),
    //countryId: z.string().min(1, "Required"),
    headquarterId: z.string().min(1, "Required"),
    departmentId: z.string().min(1, "Required"),
  })
);
