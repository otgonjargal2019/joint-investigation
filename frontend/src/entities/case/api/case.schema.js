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
    // Step 1: match basic format
    .regex(
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      "Date must be in format YYYY-MM-DD HH:mm:ss"
    )
    // Step 2: refine to check if it's a real date
    .refine((val) => {
      // Safety check for undefined/null values
      if (!val || typeof val !== "string") return false;

      // Check if the string contains both date and time parts
      if (!val.includes(" ")) return false;

      const parts = val.split(" ");
      if (parts.length !== 2) return false;

      const [datePart, timePart] = parts;

      // Check date part format
      if (!datePart || !datePart.includes("-")) return false;
      const dateParts = datePart.split("-");
      if (dateParts.length !== 3) return false;

      // Check time part format
      if (!timePart || !timePart.includes(":")) return false;
      const timeParts = timePart.split(":");
      if (timeParts.length !== 3) return false;

      const [year, month, day] = dateParts.map(Number);
      const [hour, minute, second] = timeParts.map(Number);

      // Check if conversion resulted in valid numbers
      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        isNaN(hour) ||
        isNaN(minute) ||
        isNaN(second)
      ) {
        return false;
      }

      // Check ranges
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      if (hour < 0 || hour > 23) return false;
      if (minute < 0 || minute > 59) return false;
      if (second < 0 || second > 59) return false;

      // Check days in month, including leap year for Feb
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const daysInMonth = [
        31,
        isLeap ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ];
      if (day > daysInMonth[month - 1]) return false;

      return true;
    }, "Investigation date is not a valid date and time"),
});
