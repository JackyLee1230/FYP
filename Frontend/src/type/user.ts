import { GameReview } from "./game";

export type UserPageProps = {
  user: User | null;
  reviews: GameReview[];
  errorMessage: string;
  iconUrl: string;
};

export type User = {
  id: number;
  iconUrl: string;
  name: string;
  email: string;
  password?: string;
  role: string[];
  joinDate: string;
  lastActive: Date;
  numOfReviews: number;
  reviews: GameReview[];
  age: number;
  ageGroup: string;
  gender: string;
  isVerified: boolean;
  isPrivate: boolean;
};

export const genderList = ["MALE", "FEMALE", "OTHER", "UNDISCLOSED"];

enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
  UNDISCLOSED = "Undisclosed",
}

export function getGender(key: string): string {
  return Gender[key as keyof typeof Gender];
}

