import { GameReviewPageProps } from "@/type/game";
import { getGenre } from "@/type/gameGenre";
import { getPlatform } from "@/type/gamePlatform";
import { formatTime } from "@/utils/StringUtils";
import axios from "axios";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { reviewid } = context.query;

  let review = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewById`,
      { reviewId: reviewid },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );

    if (response.status === 200) {
      review = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      review,
      errorMessage,
      iconUrl,
    },
  };
};

function GamePage({ review, errorMessage }: GameReviewPageProps) {
  if (errorMessage) {
    return <div className="text-center text-xl font-bold">{errorMessage}</div>;
  }

  if (!review) {
    return (
      <div className="text-center text-xl font-bold">Review not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>
          {review.reviewedGame.name} Review: {review.reviewer.name} | CritiQ
        </title>
      </Head>
      <h1 className="text-4xl font-bold mb-4">
        Review for {review.reviewedGame.name} by {review.reviewer.name}
      </h1>
      <p className="text-lg mb-4">Created At: {formatTime(review.createdAt)}</p>
      <p className="text-lg mb-4">Score: {review.score}</p>
      <p className="text-lg mb-4">
        Recommended: {review.recommended ? "Yes" : "No"}
      </p>
      <p className="text-lg mb-4">Comment: {review.comment}</p>
      <p className="text-lg mb-4">
        Recommendation Score: {review.recommendationScore}
      </p>
      <p className="text-lg mb-4">Game Version: {review.gameVersion}</p>
      <p className="text-lg mb-4">AI Sentiment: {review.sentiment}</p>
      <p className="text-lg mb-4">
        Sentiment Updated At:{" "}
        {format(new Date(review.sentimentUpdatedAt), "yyyy-MM-dd HH:mm:ss")}
      </p>
      <p className="text-lg mb-4">
        Platforms:{" "}
        {review.reviewedGame.platforms.map((platform) => (
          <span key={platform}>{getPlatform(platform)} </span>
        ))}
      </p>
      <p className="text-lg mb-4">
        In Development: {review.inDevelopment ? "Yes" : "No"}
      </p>
      <p className="text-lg mb-4">
        Genres:{" "}
        {review.reviewedGame.genre.map((genre) => (
          <span key={genre}>{getGenre(genre)} </span>
        ))}
      </p>
    </div>
  );
}

export default GamePage;

