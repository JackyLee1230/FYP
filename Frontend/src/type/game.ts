import Genre from "./gameGenre";
import Platform from "./gamePlatform";
import { User } from "./user";

export type GameInfo = {
  aggregatedReview: string;
  aggregatedReviewUpdatedAt: string | number | Date;
  gamePage: string;
  dlcs: GameInfo[];
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
  platforms: string[];
  inDevelopment: boolean;
  gameReviews: GameReview[];
  percentile: number;
  numberOfReviews: number;
};

export type GamePageProps = {
  game: GameInfo | null;
  reviews: GameReview[];
  errorMessage: string;
};

export type GameSearchPageProps = {
  genres: Genre[];
  platforms: Platform[];
  errorMessage: string;
};

export type GameReview = {
  sponsored: boolean;
  topics: string;
  summary: string;
  aspects: string;
  numberOfDislikes: number;
  numberOfLikes: number;
  id: string;
  gameId: string;
  createdAt: string;
  reviewer: User;
  score: number;
  recommended: boolean;
  comment: string;
  recommendationScore: number;
  sentiment: number;
  sentimentUpdatedAt: string;
  inDevelopment: boolean;
  reviewedGame: GameInfo;
  playTime: number;
  platform: string;
  likedUsers?: number[];
  dislikedUsers?: number[];
  reviewImages: string[];
  numberOfComments?: number;
  editedAt: string;
  isSpam: boolean;
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
  reviewComment: GameReviewComment[] | null;
  errorMessage: string;
  iconUrl: string;
  commentErrorMessage: string;
};

export type GameAnalytic = {
  reviewedPlatform: Record<string, number>;
  playTime: Record<string, number>;
  favouriteByAge: Record<string, number>,
  recommendedReviews: Record<string, number>,
  description: string,
  developerCompany: string,
  genderReviews: Record<string, number>,
  reviewLength: Record<string, number>,
  sentimentReviewsByGender: {
      [key: string]: Record<string, number>
  },
  score: number,
  isInDevelopment: boolean,
  id: number,
  iconUrl: string,
  favouriteByGender: Record<string, number>,
  sentimentReviews: Record<string, number>,
  releaseDate: string,
  ageReviews: Record<string, number>,
  wishlistByAge: Record<string, number>,
  isDLC: boolean,
  numberOfWishlists: number,
  wishlistByGender: Record<string, number>,
  percentile: number,
  name: string,
  generatedAt: string,
  publisher: string,
  sentimentReviewsByAge: {
      [key: string]: Record<string, number>
  },
  numberOfFavourites: number,
  numberOfReviews: number,
};

export const allGameSearchTypes = ["NAME", "DEVELOPER"] as const;
export type GameSearchType = (typeof allGameSearchTypes)[number];

