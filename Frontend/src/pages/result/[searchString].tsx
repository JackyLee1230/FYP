import React, { useState } from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { GameInfo } from "@/type/game";
import { Box, Typography, Button, Divider, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import SearchGameCard from "../../components/SearchGameCard";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX  = process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX

export type GameSearchPageProps = {
  searchString: string;
  games: GameInfo[];
  totalPages: number;
  errorMessage: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { searchString } = context.query;
  const apiUrl = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGamesByNamePaged`;
  const body = {
    name: searchString,
    gamesPerPage: 1,
    pageNum: 0,
  };

  let data = null;
  let errorMessage = null;

  try {
    const response = await axios.post(apiUrl, 
      body,
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
      data = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    console.error(error);
    errorMessage = error.toString();
  }

  const games = data.content;
  const totalPages = data.totalPages;

  return {
    props: {
      searchString,
      games,
      totalPages,
      errorMessage,
    },
  };
};

function GameSearchPage({searchString, games, totalPages, errorMessage }: GameSearchPageProps) {
  const [gameData, setGameData] = useState(games);

  const router = useRouter();
  const [page, setPage] = useState<number>(1);

  const handlePageChange = async (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    try {
    const body = {
      name: searchString,
      gamesPerPage: 1,
      pageNum: value-1,
    };
    const apiUrl = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGamesByNamePaged`;

    const response = await axios.post(
      apiUrl, 
      body,
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
      games = await response.data.content;
    } else {
      errorMessage = response.statusText;
    }
    } catch (error: any) {
      console.error(error);
      errorMessage = error.toString();
    }

    setGameData(games);
    setPage(value);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          padding: "48px 128px",
          maxWidth: 1440,
          flexDirection: "column",
          flex: "1 0 0",
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ color: "text.secondary" }}
          >
            Search Result for{" "}
            <Box
              display="inline"
              sx={{ color: "text.primary", fontWeight: 700 }}
            >{`"${router.query.searchString}"`}</Box>
          </Typography>
          <Button variant="contained" size="large" color="secondary">
            Advanced Search
          </Button>
        </Box>
        <Divider />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "32px 0px",
            gap: "32px",
          }}
        >
          {gameData && gameData.length > 0 ? (
            gameData.map((game) => <SearchGameCard key={game.id} gameData={game} />)
          ) : (
            <>
              <Typography variant="h6">No Games Found</Typography>

              {errorMessage ? (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  Error occurred during searching: {errorMessage}, please
                  contact support for help
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  We cannot find a result match with{" "}
                  <Box
                    display="inline"
                    sx={{ color: "text.primary", fontWeight: 700 }}
                  >{`"${router.query.searchString}"`}</Box>
                  , Please double check the spelling and try again.
                </Typography>
              )}
            </>
          )}
        </Box>

        <Pagination
          color="primary"
          variant="outlined"
          size="large"
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          sx={{
            "& .MuiPagination-ul": {
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />
      </Box>
    </>
  );
}

export default GameSearchPage;

