import React, { useState } from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { GameInfo } from "@/type/game";
import WebToolbar from "../../components/Toolbar";
import { Popper, Box, Typography, Button, Divider, Pagination, Fade } from "@mui/material";
import { useRouter } from "next/router";
import SearchGameCard from "../../components/SearchGameCard";
import AdvancedSearchBox from "../../components/AdvancedSearchBox";

export type GameSearchPageProps = {
  gameData: GameInfo[];
  errorMessage: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gamename, developername, platform, genre, inDevelopment } = context.query;

  const searchType = !!gamename ? "game" : "developer";
  
  const apiUrl =
  searchType == "game"
    ? "http://localhost:8080/api/game/findGamesWithSearch"
    : "http://localhost:8080/api/game/findGamesWithSearchDeveloper";

  const body = {
    name: !!gamename ? gamename : developername,
    developerCompany: !!gamename ? gamename : developername,
    genre: !(genre === undefined) ? typeof genre === "string" ? [genre] : genre : [],
    platforms: !(platform === undefined) ? typeof platform === "string" ? [platform] : platform : [],
    inDevelopment: inDevelopment === "null" ? null : inDevelopment === "true" ? true : false,
  };

  let gameData = null;
  let errorMessage = null;

  try {
    const response = await axios.post(apiUrl, body);
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
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const searchType = !!router.query.gamename ? "Game" : "Developer";
  const searchString = router.query.gamename ?? router.query.developername;
  const platform = router.query.platform;
  const genre = router.query.genre;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handlePopperClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpen((prev) => !prev);
  };

  return (
    <>
      <WebToolbar />
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
            marginBottom: "12px",
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
            >
              {`"${searchString}"`}
            </Box>
            {" "} {` By ${searchType} Name`}
          </Typography>
          <Button variant="contained" size="large" color="secondary" onClick={handlePopperClick}>
            Advanced Search
          </Button>

          <Popper open={open} anchorEl={anchorEl} placement='bottom-start' transition keepMounted>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <div>
                  <AdvancedSearchBox setOpen={setOpen}/>
                </div>
              </Fade>
            )}
          </Popper>
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
            gameData
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
                    >{" "}Or to remove some of the filter attributes</Box>
                  )}
                </Typography>
              )}
            </>
          )}
        </Box>

        {gameData && gameData.length > 0 &&
          <Pagination
            color="primary"
            variant="outlined"
            size="large"
            count={Math.ceil(gameData.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
            sx={{
              "& .MuiPagination-ul": {
                alignItems: "center",
                justifyContent: "center",
              },
            }}
          />
        }
      </Box>
    </>
  );
}

export default GameSearchPage;

