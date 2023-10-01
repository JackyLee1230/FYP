import { GameReview } from "./game";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  joinDate: string;
  lastActive: Date;
  numOfReviews: number;
  reviews: GameReview[];
};

