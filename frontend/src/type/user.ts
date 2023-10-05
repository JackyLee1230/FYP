import { GameReview } from "./game";

export type UserPageProps = {
  user: User | null;
  reviews: GameReview[];
  errorMessage: string;
  iconUrl: string;
};

export type User = {
  id: string;
  iconUrl: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  joinDate: string;
  lastActive: Date;
  numOfReviews: number;
  reviews: GameReview[];
};

