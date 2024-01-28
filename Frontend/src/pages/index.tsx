import Head from "next/head";
import Image from "next/image";
import "tailwindcss/tailwind.css";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type GameInfo = {
  id: number;
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

type LandingPageProps = {
  games: GameInfo[];
  errorMessage: string;
};

const Dashboard = () => {
  return (
    <>
      <Head>
        <title>
          CritiQ - Game Testing and Evaluation Platform with Machine Learning
          for Game Developers
        </title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-9/12 flex-1 text-center">
          <Image src="/logo.png" width={528} height={160} alt="CritiQ Icon" />
          <h1 className="text-6xl font-bold">
            Welcome to CritiQ, A Revolutional Game Testing and Evaluation
            Platform with Machine Learning for Game Developers!
          </h1>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

