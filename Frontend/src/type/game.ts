import Genre from "./gameGenre";
import Platform from "./gamePlatform";
import { User } from "./user";

export type GameInfo = {
  gamePage: string;
  iconUrl: any;
  id: string;
  name: string;
  dlc: boolean;
  baseGame: GameInfo;
  description: string;
  releaseDate: string;
  developerCompany: string;
  publisher: string;
  score: number;
  recommendationScore: number;
  genre: Genre[];
  versions: GameVersion[];
  version: string;
  platforms: string[];
  inDevelopment: boolean;
  gameReviews: GameReview[];
  percentile: number;
};

export type GameVersion = {
  id: string;
  versionedGame: GameInfo;
  version: string;
  releaseDate: string;
  url: string;
  createdAt: Date;
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
  inDevelopment: boolean;
  reviewedGame: GameInfo;
  playTime: number;
  platform: string;
  reviewComments: GameReviewComment[];
  likedUser?: number[];
  dislikedUser?: number[];
  reviewImages: string[];
};

export type GameReviewComment = {
  id: string;
  commenter: User;
  createdAt: Date;
  updatedAt: Date;
  review: GameReview;
  comment: string;
};

export type GameReviewPageProps = {
  game: GameInfo | null;
  review: GameReview | null;
  errorMessage: string;
  iconUrl: string;
};

export const allGameSearchTypes = ["NAME", "DEVELOPER"] as const;
export type GameSearchType = (typeof allGameSearchTypes)[number];

