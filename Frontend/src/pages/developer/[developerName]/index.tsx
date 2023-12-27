import { GameInfo } from "@/type/game";
import axios from "axios";
import { GetServerSideProps } from "next";
import React from "react";

type DeveloperPageProps = {
  name: string;
  games: GameInfo[] | null;
};

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { developerName } = context.query;

  let games: GameInfo[] | null = null;
  let errorMessage = null;

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGamesByDeveloperCompany`,
      { developerCompany: developerName },
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
      console.log(response.data);
      games = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
  }

  return {
    props: {
      name: developerName,
      games,
    },
  };
};

const DeveloperPage: React.FC<DeveloperPageProps> = ({
  name,
  games,
}: DeveloperPageProps) => {
  return (
    <div>
      <h1>{name}</h1>
      {games && (
        <div>
          {games.map((game) => {
            return <div key={game.id}>{game.name}</div>;
          })}
        </div>
      )}{" "}
    </div>
  );
};

export default DeveloperPage;

