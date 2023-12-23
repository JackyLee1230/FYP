import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { GameInfo } from "@/type/game";
import {
  Popper,
  Box,
  Typography,
  Button,
  Divider,
  Pagination,
  Fade,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/router";
import SearchGameCard from "../../components/SearchGameCard";
import AdvancedSearchBox from "../../components/AdvancedSearchBox";
import Head from "next/head";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export type GameSearchPageProps = {
  gameData: GameInfo[];
  errorMessage: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let { gamename, developername, platform, genre, isInDevelopment } =
    context.query;

  let isGamenameNull = gamename === "null" || gamename === undefined;
  const isDevelopernameNull =
    developername === "null" || developername === undefined;

  let searchType = !isGamenameNull ? "game" : "developer";

  if (isGamenameNull && isDevelopernameNull) {
    gamename = "";
    searchType = "game";
    isGamenameNull = false;
  }

  const apiUrl =
    searchType == "game"
      ? `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGamesWithSearch`
      : `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGamesWithSearchDeveloper`;

  const body = {
    name: !isGamenameNull ? gamename : developername,
    developerCompany: !isGamenameNull ? gamename : developername,
    genre: !(genre === undefined)
      ? typeof genre === "string"
        ? [genre]
        : genre
      : [],
    platforms: !(platform === undefined)
      ? typeof platform === "string"
        ? [platform]
        : platform
      : [],
    isInDevelopment:
      isInDevelopment === "null" || isInDevelopment === undefined || isInDevelopment === null
        ? null
        : isInDevelopment === "true"
        ? true
        : false,
  };

  let gameData = null;
  let errorMessage = null;

  try {
    const response = await axios.post(apiUrl, body, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
    if (response.status === 200) {
      gameData = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
  }

  return {
    props: {
      gameData,
      errorMessage,
    },
  };
};

function GameSearchPage({ gameData, errorMessage }: GameSearchPageProps) {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [gameInfoData, setGameInfoData] = useState<GameInfo[]>(gameData);
  const [order, setOrder] = useState<string>("relevance");
  const searchType = !!router.query.gamename ? "Game" : "Developer";
  const searchGamename = router.query.gamename;
  const searchDevelopername = router.query.developername;
  const searchString =
    searchType === "Game" ? searchGamename : searchDevelopername;
  const platform = router.query.platform;
  const genre = router.query.genre;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    window.scrollTo(0, 0);
    setPage(value);
  };

  const handlePopperClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen((prev) => !prev);
  };

  const handleOrderSorting = (event: SelectChangeEvent) => {
    setOrder(event.target.value as string);

    if (event.target.value === "score") {
      setGameInfoData(
        [...gameData].sort((a, b) => (a.score < b.score ? 1 : -1))
      );
    } else if (event.target.value === "releaseDate") {
      setGameInfoData(
        [...gameData].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1))
      );
    } else {
      setGameInfoData(gameData);
    }
    setPage(1);
  };

  useEffect(() => {
    if (gameData) {
      if (order === "score") {
        setGameInfoData(
          [...gameData].sort((a, b) => (a.score < b.score ? 1 : -1))
        );
      } else if (order === "releaseDate") {
        setGameInfoData(
          [...gameData].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1))
        );
      } else {
        setGameInfoData(gameData);
      }
    }
  }, [gameData, order]);

  useEffect(() => {
    setPage(1);
  }
  , [gameInfoData]);

  return (
    <>
      <Head>
        <title>Search: {searchString} | CritiQ</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          padding: "48px 32px",
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
            marginBottom: "12px",
          }}
        >
          {searchGamename || searchDevelopername ? (
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "text.secondary" }}
            >
              Search Result for{" "}
              <Box
                display="inline"
                sx={{ color: "text.primary", fontWeight: 700 }}
              >
                {`"${searchString}"`}
              </Box>{" "}
              {` By ${searchType} Name`}
            </Typography>
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "text.secondary" }}
            >
              All Games
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "row", gap: "12px" }}>
            <FormControl sx={{ minWidth: 146 }}>
              <Select
                color="secondary"
                value={order}
                onChange={handleOrderSorting}
                autoWidth={false}
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="score">Score</MenuItem>
                <MenuItem value="releaseDate">Release Date</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={handlePopperClick}
            >
              Advanced Search
            </Button>

            <Popper
              open={open}
              anchorEl={anchorEl}
              placement="bottom-start"
              transition
              keepMounted
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <div>
                    <AdvancedSearchBox setOpen={setOpen} />
                  </div>
                </Fade>
              )}
            </Popper>
          </Box>
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
          {gameInfoData && gameInfoData.length > 0 ? (
            gameInfoData
              .slice((page - 1) * rowsPerPage, page * rowsPerPage)
              .map((game) => <SearchGameCard key={game.id} gameData={game} />)
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
                  contact support for help.
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
                  >{`"${searchString}"`}</Box>
                  , Please double check the spelling and try again.
                  {(platform || genre) && (
                    <Box
                      display="inline"
                      sx={{ color: "text.secondary", fontWeight: 400 }}
                    >
                      {" "}
                      Or to remove some of the filter attributes
                    </Box>
                  )}
                </Typography>
              )}
            </>
          )}
        </Box>

        {gameInfoData && gameInfoData.length > 0 && (
          <Pagination
            color="primary"
            variant="outlined"
            size="large"
            count={Math.ceil(gameInfoData.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPagination-ul": {
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          />
        )}
      </Box>
    </>
  );
}

export default GameSearchPage;

