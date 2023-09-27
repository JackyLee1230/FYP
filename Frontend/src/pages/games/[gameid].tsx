import React from 'react';
import { GetServerSideProps } from 'next';
import 'tailwindcss/tailwind.css';
import axios from 'axios';

type GameInfo = {
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

type GamePageProps = {
  game: GameInfo | null;
  errorMessage: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gameid } = context.query;

  let game = null;
  let errorMessage = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post('http://localhost:8080/api/game/findGameById', {id: gameid});

    if(response.status === 200){
      game = await response.data;
    }
    else{
      errorMessage = response.statusText;
    }

  } catch (error: any) {
    console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      game,
      errorMessage,
    },
  };
};

function GamePage({ game, errorMessage }: GamePageProps) {
  if(errorMessage){
    return <div className="text-center text-xl font-bold">{errorMessage}</div>;
  }

  if(!game) {
    return <div className="text-center text-xl font-bold">Game not found</div>;
  }

  return(
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
      <p className="text-lg mb-4">{game.description}</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="font-bold">Release Date:</span>
          {game.releaseDate ? (
            <span>{game.releaseDate}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Developer Company:</span>
          {game.developerCompany ? (
            <span>{game.developerCompany}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Publisher:</span>
          {game.publisher ? (
            <span>{game.publisher}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Score:</span>
          {game.score ? (
            <span>{game.score}</span>
          ) : (
            <span className="text-gray-500">No Review Yet</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Recommendation Score:</span>
          {game.recommendationScore ? (
            <span>{game.recommendationScore}</span>
          ) : (
            <span className="text-gray-500">No Review Yet</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Genre:</span>
          {game.genre && game.genre.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.genre.map((genre) => (
                <li key={genre}>{genre}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Versions:</span>
          {game.versions && game.versions.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.versions.map((version) => (
                <li key={version}>{version}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Version:</span>
          {game.version ? (
            <span>{game.version}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Platforms:</span>
          {game.platforms && game.platforms.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.platforms.map((platform) => (
                <li key={platform}>{platform}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">In Development:</span>

          {typeof game.inDevelopment === 'boolean' ? (
            game.inDevelopment ? (
              <span>Yes</span>
            ) : (
              <span>No</span>
            )
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamePage;