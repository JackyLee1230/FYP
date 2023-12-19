import React, { use, useCallback, useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { GameInfo, GamePageProps, GameReview } from "@/type/game";
import Platform, { getPlatform } from "@/type/gamePlatform";
import Genre, { getGenre } from "@/type/gameGenre";
import Head from "next/head";
import { useRouter } from "next/router";
import { formatTime } from "@/utils/StringUtils";
import Link from "next/link";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import _ from "lodash";
import {
  Box,
  Button,
  Typography,
  styled,
  Tooltip,
  CircularProgress,
  circularProgressClasses,
  ButtonBase,
  Divider,
  Grid,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import Image from "next/image";
import { alpha } from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import { EarlyAccessDefinition, DLCDefinition } from "@/utils/Definition";
import { getScoreColor } from "@/utils/DynamicScore";
import GameReviewCard from "@/components/GameReviewCard";
import { getStoreIcons } from "@/utils/GameLinksIcons";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gameid } = context.query;

  let game = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGameById`,
      { id: gameid, includeReviews: false, inclinudePlatformReviews: false },
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
      game = await response.data;
      if (game.iconUrl) {
        iconUrl = `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${game.iconUrl}`;
      }
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
  }

  return {
    props: {
      game,
      errorMessage,
      iconUrl,
    },
  };
};

const StyledBrokenImageIcon = styled(BrokenImageIcon)(({ theme }) => ({
  fontSize: 300,
  color: theme.palette.error.main,
}));

const fetchReview = async (
  gameId: string,
  recommended: boolean | null,
  sortBy: "recency" | "score"
) => {
  let review = null;
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewsByGameIdPaged`;
  const body = {
    gameId: gameId,
    reviewsPerPage: 12,
    pageNum: 0,
    recommended: recommended,
    sortBy: sortBy,
  };
  try {
    const response = await axios.post(apiAddress, body, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });

    if (response.status === 200) {
      review = await response.data.content;
    }
  } catch (error: any) {
    console.error(error);
  }

  return review;
};

function GamePage({ game, errorMessage, iconUrl }: GamePageProps) {
  const [reviewTypeValue, setReviewTypeValue] = useState(0);
  const [reviews, setReviews] = useState<null | GameReview[]>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recency" | "score">("recency");

  const handleReviewTypeChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    setReviewTypeValue(newValue);
  };

  const handleReviewFetch = useCallback(
    async (recommended: boolean | null) => {
      if (game) {
        setIsReviewLoading(true);
        const reviews = await fetchReview(game.id, recommended, sortBy);
        setReviews(reviews);
        setIsReviewLoading(false);
      }
    },
    [game, sortBy]
  );

  useEffect(() => {
    handleReviewFetch(
      reviewTypeValue === 0 ? null : reviewTypeValue === 1 ? true : false
    );
  }, [handleReviewFetch, reviewTypeValue, sortBy]);

  if (errorMessage) {
    return <div className="text-center text-xl font-bold">{errorMessage}</div>;
  }

  if (!game) {
    return <div className="text-center text-xl font-bold">Game not found</div>;
  }

  return (
    <div>
      <Head>
        <title>{game.name}</title>
      </Head>
      <Box
        sx={(theme) => ({
          position: "absolute",
          left: "-18.105px",
          top: "-48.711px",
          width: "110%",
          height: "250px",
          transform: "rotate(-2deg)",
          background: theme.palette.secondary.main,
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          zIndex: -1,
        })}
      />

      <Box
        sx={{
          display: "flex",
          padding: "24px 86px",
          maxWidth: 1440,
          flexDirection: "column",
          flex: "1 0 0",
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "stretch",
            borderRadius: "48px 48px 168px 24px",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            background: alpha("#FFFFFF", 0.5),
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "516px",
              width: "100%",
              display: "flex",
              position: "relative",
            }}
          >
            {iconUrl ? (
              <Image
                loading={"lazy"}
                src={iconUrl}
                alt="Game Icon"
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  flexDirection: "column",
                }}
              >
                <StyledBrokenImageIcon />
                <Typography variant="h3" color="error">
                  This game has no icon
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                padding: "24px 42px",
                width: "100%",
                height: "100%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  right: "42px",
                }}
              >
                <Button variant="contained" color="primary">
                  more
                </Button>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  right: "42px",
                  bottom: "24px",
                }}
              >
                {game.genre && game.genre.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      alignSelf: "stretch",
                      gap: "16px",
                    }}
                  >
                    <Box
                      sx={(theme) => ({
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: theme.palette.background.default,
                        background: theme.palette.info.main,
                        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        display: "flex",
                        padding: "4px 16px",
                        justifyContent: "center",
                        alignItems: "center",
                      })}
                    >
                      <Typography variant="h6" color="background.default">
                        {game.genre &&
                          game.genre.length > 0 &&
                          game.genre
                            .slice(0, 3)
                            .map((genre) => getGenre(genre))
                            .join(", ")}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  left: "42px",
                  bottom: "24px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "row",
                  gap: "16px",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                {game.inDevelopment && (
                  <Tooltip title={EarlyAccessDefinition}>
                    <Box
                      sx={(theme) => ({
                        borderRadius: "64px",
                        background: theme.palette.secondary.main,
                        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset",
                        display: "flex",
                        padding: "12px 32px",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                        flexDirection: "row",
                      })}
                    >
                      <Typography variant="h4" color="background.default">
                        Early Access
                      </Typography>
                      <HelpOutlineIcon
                        sx={{
                          fontSize: "24px",
                          color: "background.default",
                        }}
                      />
                    </Box>
                  </Tooltip>
                )}
                {game.dlc && game.baseGame && (
                  <Tooltip title={DLCDefinition(game?.baseGame?.name)}>
                    <ButtonBase
                      LinkComponent={Link}
                      href={`/games/${game?.baseGame?.id}`}
                      sx={{
                        borderRadius: "32px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={(theme) => ({
                          background: theme.palette.info.main,
                          boxShadow:
                            "0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset",
                          display: "flex",
                          padding: "4px 16px",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "8px",
                          flexDirection: "row",
                          height: "fit-content",
                        })}
                      >
                        <Typography variant="h5" color="background.default">
                          DLC
                        </Typography>
                        <ArrowCircleRightOutlinedIcon
                          sx={{
                            fontSize: "16px",
                            color: "background.default",
                          }}
                        />
                      </Box>
                    </ButtonBase>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          <Box
            sx={(theme) => ({
              display: "flex",
              width: "100%",
              padding: "24px 32px",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              background: theme.palette.background.paper,
            })}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                alignSelf: "stretch",
              }}
            >
              <Typography
                variant="h4"
                color="text.primary"
                sx={{
                  fontWeight: 700,
                  textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  textAlign: "center",
                }}
              >
                {game.name}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "flex-start",
                gap: "16px",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexShrink: 0,
                  alignSelf: "stretch",
                  flex: 1,
                  wordBreak: "break-word",
                }}
              >
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    textOverflow: "ellipsis",
                    fontWeight: 500,
                    overflow: "hidden",
                  }}
                >
                  {`${game.description ?? "No Description"}`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Platform(s): </b>
                  {game?.platforms && game?.platforms.length > 0
                    ? game?.platforms
                        .map((platform) => getPlatform(platform))
                        .join(", ")
                    : "Unknown"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Version: </b>
                  {`${game?.version ? game?.version : "Unknown"}`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Released On: </b>
                  {`${game?.releaseDate ? game?.releaseDate : "Unknown"}`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Developed By: </b>
                  {`${
                    game?.developerCompany ? game?.developerCompany : "Unknown"
                  }`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Published By: </b>
                  {`${game?.publisher ? game?.publisher : "Unknown"}`}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {getStoreIcons(game.gamePage)}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                }}
              >
                <CircularProgress
                  variant="determinate"
                  size={264}
                  thickness={3}
                  value={100}
                  sx={(theme) => ({
                    color: theme.palette.divider,
                    opacity: 0.2,
                  })}
                />
                <CircularProgress
                  variant="determinate"
                  size={264}
                  thickness={3}
                  value={game?.score ?? 0}
                  disableShrink
                  color={getScoreColor(game?.percentile)}
                  sx={{
                    position: "absolute",
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: "round",
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h1"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    }}
                    color={`${getScoreColor(game?.percentile)}.main`}
                  >
                    {`${Math.round(game?.score)}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box>
          <Divider sx={{ margin: "24px 0px" }} textAlign="left">
            <Tooltip
              title={
                "The Aggregated Review is a review generated by our AI based on the user reviews."
              }
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "12px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h4"
                  color="info.main"
                  sx={{ fontWeight: 700 }}
                >
                  Aggregated Review
                </Typography>
                <HelpOutlineIcon
                  sx={{
                    fontSize: "24px",
                    color: "info.main",
                  }}
                />
              </Box>
            </Tooltip>
          </Divider>
          <Typography
            variant="subtitle1"
            color="info.main"
            sx={{ fontWeight: 500 }}
          >
            COMING SOON....
          </Typography>
        </Box>

        <Box>
          <Divider sx={{ margin: "12px 0px" }} textAlign="left">
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "12px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h4"
                color="secondary.main"
                sx={{ fontWeight: 700 }}
              >
                User Reviews
              </Typography>
              <Button variant="contained" color="secondary">
                Add Review
              </Button>
            </Box>
          </Divider>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              marginBottom: 4,
            }}
          >
            <Tabs
              value={reviewTypeValue}
              onChange={handleReviewTypeChange}
              indicatorColor="secondary"
              textColor="secondary"
              variant="fullWidth"
              sx={{
                width: "100%",
              }}
            >
              <Tab label="All Review" />
              <Tab label="Positive" />
              <Tab label="Negative" />
            </Tabs>
            <FormControl sx={{ minWidth: 124 }}>
              <Select
                color="secondary"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "recency" | "score")
                }
                autoWidth={false}
              >
                <MenuItem value="recency">Recency</MenuItem>
                <MenuItem value="score">Score</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {isReviewLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "164px",
              }}
            >
              <CircularProgress size={56} thickness={4} color="secondary" />
            </Box>
          ) : reviews && reviews.length > 0 ? (
            <Grid container rowSpacing={{ xs: 2, lg: 4 }} columnSpacing={2}>
              {reviews.map((review) => (
                <Grid item xs={12} lg={6} key={review.id}>
                  <GameReviewCard review={review} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box>
              <Typography
                variant="subtitle1"
                color="secondary.main"
                sx={{ fontWeight: 500 }}
              >
                No Reviews
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default GamePage;

