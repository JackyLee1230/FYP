import React from "react";

import { User, UserPageProps } from "@/type/user";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userid } = context.query;

  let user = null;
  let reviews = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      "http://localhost:8080/api/user/findUserById",
      { id: userid }
    );

    if (response.status === 200) {
      user = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    // console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      user,
    },
  };
};

export default function User({ user }: UserPageProps) {
  const router = useRouter();

  if (user == null) {
    return <div>User not found</div>;
  }

  return (
    <>
      {user.iconUrl ? (
        <img
          className="w-24 h-24 rounded-full mx-auto"
          src={`${process.env.GAMES_STORAGE_PATH_PREFIX}${user.iconUrl}`}
          alt="User icon"
        />
      ) : (
        <div className="w-24 h-24 rounded-full mx-auto bg-gray-200" />
      )}
      <br />
      {user.name}
      <br />
      {user.email}
      <br />
      {user.joinDate}
      <br />
      {user.lastActive}
      <br />
      User has {user.reviews.length} review
      {user.reviews && user.reviews.length > 0 && (
        <div className="gap-4">
          {user.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-green-200 cursor-pointer"
              onClick={() => {
                router.push(`/review/${review.id}`);
              }}
            >
              <br />
              {review.reviewedGame.name}
              <br />
              {review.score}
              <br />
              {review.createdAt}
              <br />
              {review.comment}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

