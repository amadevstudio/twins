import { z } from "zod";

export const emailSchema = z.string().email();

export const subscribeAnonSchema = z.object({
  email: emailSchema,
  query: z.string().min(1)
});
