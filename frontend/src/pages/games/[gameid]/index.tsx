import React from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";

import { GameInfo, GamePageProps } from "@/type/game";
import Platform, { getPlatform } from "@/type/gamePlatform";
import Genre, { getGenre } from "@/type/gameGenre";
import Head from "next/head";
import { useRouter } from "next/router";
import { formatTime } from "@/utils/StringUtils";

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  const { gameid } = context.query;

  let game = null;
  let reviews = null;
  let errorMessage = null;
  let iconUrl = null;

  console.log("ASDASD" + gameid);

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      "http://localhost:8080/api/game/findGameById",
      { id: gameid }
    );
    const reviewsResponse = await axios.post(
      "http://localhost:8080/api/review/getReviewsByGameId",
      { gameId: gameid }
    );

    if (response.status === 200 && reviewsResponse.status === 200) {
      game = await response.data;
      reviews = await reviewsResponse.data;
      if (game.iconUrl) {
        iconUrl = `${process.env.GAMES_STORAGE_PATH_PREFIX}${game.iconUrl}`;
      }
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    // console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      game,
      reviews,
      errorMessage,
      iconUrl,
    },
  };
};

function GamePage({ game, reviews, errorMessage, iconUrl }: GamePageProps) {
  const router = useRouter();

  if (errorMessage) {
    return <div className="text-center text-xl font-bold">{errorMessage}</div>;
  }

  if (!game) {
    return <div className="text-center text-xl font-bold">Game not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{game.name}</title>
      </Head>
      {iconUrl ? (
        <div className="text-5xl mb-4 font-bold">
          <img src={iconUrl} alt={"Game Icon"}></img>
        </div>
      ) : (
        <p className="text-5xl mb-4 font-bold">This game has no icon!</p>
      )}

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
                <li key={genre}>{getGenre(genre)}</li>
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
                <li key={platform}>{getPlatform(platform)}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">In Development:</span>

          {typeof game.inDevelopment === "boolean" ? (
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

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col">
          {reviews.length > 1 ? `Reviews [${reviews.length}]` : "Review [1]"}:
        </div>

        {reviews && reviews.length > 0 ? (
          <div className="list-disc list-inside">
            {reviews.map((review) => (
              <div
                onClick={() => {
                  router.push(`/review/${review.id}`);
                }}
                key={review.id}
                className="bg-gray-500 rounded-md cursor-pointer"
              >
                <div className="m-4">
                  <p>
                    Review By {review.reviewer.name} on{" "}
                    {formatTime(review.createdAt)}:
                    <br />
                    Score: {review.score}
                    <br />
                    <p>AI Sentiment: {review.sentiment}</p>
                  </p>
                  <br />
                  {review.comment}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">No Review Yet</span>
        )}
      </div>
    </div>
  );
}

export default GamePage;
