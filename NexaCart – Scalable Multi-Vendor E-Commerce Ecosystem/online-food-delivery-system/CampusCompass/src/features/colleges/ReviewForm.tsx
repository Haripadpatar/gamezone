"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1 star").max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters long"),
});

interface ReviewFormProps {
  collegeId: string;
}

export default function ReviewForm({ collegeId }: ReviewFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validation = reviewSchema.safeParse({ rating, comment });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/colleges/${collegeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast(data.message || "Failed to submit review", "error");
        setLoading(false);
        return;
      }

      toast("Review posted successfully!", "success");
      setComment("");
      setRating(5);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="pt-6 text-center space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Share your student experience</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sign in to your account to write a review about the campus, placements, and courses.
          </p>
          <Button
            onClick={() => router.push(`/login?callbackUrl=/colleges/${collegeId}`)}
            size="sm"
          >
            Sign In to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Write a Student Review</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating stars */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Campus Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 -ml-1 text-slate-300 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`h-7 w-7 ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Comment / Experience
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="Tell us about the courses, facilities, placements, and campus environment..."
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <Button
            type="submit"
            isLoading={loading}
            size="sm"
            className="gap-1.5 cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
          >
            Submit Review
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
