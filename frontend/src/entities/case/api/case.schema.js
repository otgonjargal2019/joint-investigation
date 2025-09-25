import { z } from "zod";

export const caseSchema = z.object({
  caseNumber: z.string().optional(),
  caseName: z.string().min(1, "Case name is required"),
  caseOutline: z.string().min(1, "Case outline is required"),
  contentType: z.enum(
    [
      "Video",
      "Audio",
      "Image",
      "Text",
      "Software",
      "Game",
      "Mixed Media",
      "Other",
    ],
    {
      errorMap: () => ({ message: "Please select a valid content type" }),
    }
  ),
  infringementType: z.enum(
    [
      "PLATFORMS_SITES",
      "LINK_SITES",
      "WEBHARD_P2P",
      "TORRENTS",
      "SNS",
      "COMMUNITIES",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Please select a valid infringement type" }),
    }
  ),
  relatedCountries: z.string().min(1, "Please select a country"),
  priority: z.coerce
    .number()
    .int("Priority must be a whole number")
    .min(1, "Priority must be at least 1")
    .max(5, "Priority must be at most 5"),
  etc: z.string().optional(),
  investigationDate: z
    .string()
    .min(1, "Investigation date is required")
    .length(19, "Please complete the full date and time (YYYY-MM-DD HH:mm:ss)")
    .regex(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Date must be in format YYYY-MM-DD HH:mm:ss"
    ),
});
