import React from "react";
import { User, UserPageProps } from "@/type/user";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useRouter } from "next/router";
import RoleChip from "@/components/RoleChip";
import { Button, Stack } from "@mui/material";
import Head from "next/head";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userid } = context.query;

  let user = null;
  let reviews = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/findUserById`,
      { id: userid },
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

const sendVerifyEmail = async (email: string) => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/sendVerifyEmail`,
      { email: email },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    console.error(error);
  }
};

export default function User({ user }: UserPageProps) {
  const router = useRouter();

  if (user == null) {
    return <div>User not found</div>;
  }

  return (
    <>
      <Head>
        <title>{user.name ?? "Invalid User"} | CritiQ</title>
      </Head>
      {user.iconUrl ? (
        <img
          className="w-24 h-24 rounded-full mx-auto"
          src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user.iconUrl}`}
          alt="User icon"
        />
      ) : (
        <div className="w-24 h-24 rounded-full mx-auto bg-gray-200" />
      )}
      <RoleChip role={user.role} direction="row" includeUser={true} />
      <br />
      {user.isVerified === null || user.isVerified === false ? (
        <>
          <Button
            variant="contained"
            onClick={() => {
              sendVerifyEmail(user.email);
            }}
          >
            Not verified, Click to resend Verify Email
          </Button>
          <br />
        </>
      ) : (
        <div>Verified</div>
      )}
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

