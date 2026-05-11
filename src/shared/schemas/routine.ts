import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;

// Form-side schema. The form has both DAILY/WEEKLY/MONTHLY fields visible
// (some hidden by `freq`) — we keep all of them in the values bag and use
// superRefine to require the right ones for the chosen frequency. This is
// the standard zod pattern for "field X is required when field Y = …".
export const RoutineFormSchema = z
  .object({
    title: z.string().trim().min(1, "TITLE_REQUIRED").max(300),
    freq: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    byWeekday: z.number().int().min(0).max(127),
    byMonthDay: z.number().int().min(1).max(31),
    // We accept empty string as "no time set"; server gets null.
    timeOfDay: z.union([z.string().regex(HHMM), z.literal("")]),
    startDate: z.string().regex(ISO_DATE, "INVALID_DATE"),
    endDate: z.union([z.string().regex(ISO_DATE), z.literal("")]),
    categoryId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.freq === "WEEKLY" && data.byWeekday === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["byWeekday"],
        message: "WEEKLY_AT_LEAST_ONE",
      });
    }
    if (data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "END_BEFORE_START",
      });
    }
  });

export type RoutineFormValues = z.infer<typeof RoutineFormSchema>;
