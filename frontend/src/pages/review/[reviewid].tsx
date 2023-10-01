import React from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { format } from "date-fns";

import { GameReview, GameReviewPageProps } from "@/types/game";
import Platform, { getPlatform } from "@/types/gamePlatform";
import Genre, { getGenre } from "@/types/gameGenre";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { reviewid } = context.query;

  let review = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      "http://localhost:8080/api/review/getReviewById",
      { reviewId: reviewid }
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
      <h1 className="text-4xl font-bold mb-4">
        Review for {review.reviewedGame.name} by {review.reviewer.name}
      </h1>
      <p className="text-lg mb-4">
        Created At: {format(new Date(review.createdAt), "yyyy-MM-dd HH:mm:ss")}
      </p>
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

