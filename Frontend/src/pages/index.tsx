import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
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

// export const getServerSideProps: GetServerSideProps = async () => {
//   let games = null;
//   let errorMessage = null;

//   try {
//     const response = await axios.get(
//       `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getAllGames`,
//       {
//         headers: {
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
//           "Access-Control-Allow-Headers": "Content-Type, Authorization",
//           "Access-Control-Allow-Credentials": "true",
//         },
//       }
//     );
//     games = response.data;

//     if (response.status === 200) {
//       games = await response.data;
//     } else {
//       errorMessage = response.statusText;
//     }
//   } catch (error: any) {
//     // Handle the error
//     console.error(error);
//     errorMessage = error.toString();
//   }

//   return {
//     props: {
//       games,
//       errorMessage,
//     },
//   };
// };

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

          <div className="flex mt-6">
            <Link
              href="/new-game"
              className="m-3 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add New Game
            </Link>

            <Link
              href="/new-review"
              className="m-3 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Add New Review
            </Link>
          </div>

          {/*<div className="mt-6 w-full">
            <h2 className="text-3xl font-bold mb-4">All Games</h2>
            {games && games.length > 0 ? (
              <div className="flex flex-col justify-center content-center flex-wrap mt-6">
                {games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="w-fit m-3 px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    {game.name}
                  </Link>
                ))}
              </div>
            ) : (
              <h2 className="text-3xl font-bold mb-4">No games found</h2>
            )}
          </div>*/}
        </main>
      </div>
    </>
  );
};

export default Dashboard;

