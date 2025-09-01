import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "title is required"),
});
