import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1 star").max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters long"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
