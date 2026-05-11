import { z } from "zod";

const HEX = /^#[0-9a-fA-F]{6}$/;

export const CategoryFormSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(HEX, { message: "INVALID_COLOR" }),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
