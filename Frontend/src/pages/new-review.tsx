import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "tailwindcss/tailwind.css";
import axios from "axios";
import Switch from "@mui/material/Switch";
import { useAuthContext } from "@/context/AuthContext";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type ReviewData = {
  gameId: number;
  reviewerId: number;
  score: number;
  comment: string;
  recommended: boolean;
};

const AddNewReview = () => {
  const { user, token } = useAuthContext();
  useEffect(() => {
    if (user && token) {
      setReviewerId(user.id);
    }
  }, [user, token]);

  const router = useRouter();
  const [gameId, setGameId] = useState(0);
  const [reviewerId, setReviewerId] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [recommended, setRecommended] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reviewData: ReviewData = {
      gameId: gameId,
      reviewerId: reviewerId,
      score: score,
      comment: comment,
      recommended: recommended,
    };
    console.debug(reviewData);

    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/addReview`,
        reviewData,
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
        console.debug("Review added successfully");
        router.push(`/review/${response.data.id}`);
      } else {
        setError(response.data.message);
        console.debug("Failed to add review", response);
      }
    } catch (error: any) {
      setError(error.response.data.message);
      console.error("Failed to add review");
    }
  };

  if (reviewerId === 0)
    return (
      <div className="mt-4">
        <p>Please login to add a review</p>
        <Link
          href="/login"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    );

  return (
    <div className="mt-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col items-left space-x-2">
          <label htmlFor="gameId">Game ID</label>
          <input
            value={gameId}
            onChange={(e) => setGameId(Number(e.target.value))}
            placeholder="Game ID"
            type="number"
            min="0"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="flex flex-col items-left space-x-2">
          <label htmlFor="reviewerId">{"Score (From 0 to 100)"} </label>
          <input
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            placeholder="Score"
            type="number"
            min="0"
            max="100"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comment"
          required
          className="w-full p-2 border border-gray-300 rounded h-20"
        />
        <div className="flex items-center space-x-2">
          <label htmlFor="recommended">Recommended</label>
          <Switch
            checked={recommended}
            onChange={(e) => setRecommended(e.target.checked)}
            inputProps={{ "aria-label": "controlled" }}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Submit Review
        </button>
      </form>

      <Link
        href="/"
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default AddNewReview;

