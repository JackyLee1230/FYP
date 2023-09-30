export type GameInfo = {
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
  errorMessage: string;
  iconUrl: string;
};

