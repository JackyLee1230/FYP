import Genre from "./gameGenre";
import Platform from "./gamePlatform";
import { User } from "./user";

export type GameInfo = {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  developerCompany: string;
  publisher: string;
  score: number;
  recommendationScore: number;
  genre: string[];
  versions: string[];
  version: string;
  platforms: string[];
  inDevelopment: boolean;
};

export type GamePageProps = {
  game: GameInfo | null;
  reviews: GameReview[];
  errorMessage: string;
  iconUrl: string;
};

export type GameSearchPageProps = {
  genres: Genre[];
  platforms: Platform[];
  errorMessage: string;
};

export type GameReview = {
  id: string;
  gameId: string;
  createdAt: string;
  reviewer: User;
  score: number;
  recommended: boolean;
  comment: string;
  recommendationScore: number;
  gameVersion: string;
  sentiment: number;
  sentimentUpdatedAt: string;
  platforms: string[];
  inDevelopment: boolean;
  reviewedGame: GameInfo;
};

export type GameReviewPageProps = {
  game: GameInfo | null;
  review: GameReview | null;
  errorMessage: string;
  iconUrl: string;
};
export const allGameSearchTypes = ["NAME", "DEVELOPER"] as const;
export type GameSearchType = (typeof allGameSearchTypes)[number];

