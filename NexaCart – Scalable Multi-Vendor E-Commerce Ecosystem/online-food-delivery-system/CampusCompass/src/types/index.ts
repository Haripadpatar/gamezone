import { Review } from "@prisma/client";

export interface College {
  id: string;
  name: string;
  location: string;
  description: string;
  fees: number;
  rating: number;
  placementPercentage: number;
  imageUrl: string;
  courses: string[];
}

export type CollegeWithReviews = College & {
  reviews: Review[];
};

export interface SearchFilters {
  search?: string;
  location?: string;
  minFee?: number;
  maxFee?: number;
  sortBy?: "rating" | "fees" | "placementPercentage";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
