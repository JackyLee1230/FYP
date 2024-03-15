import { CustomArrowLeft, CustomArrowRight } from "@/components/CustomArrows";
import GameDLCCard from "@/components/GameDLCCard";
import GameDLCCardSmall from "@/components/GameDLCCardSmall";
import GameDetailBox from "@/components/GameDetailBox";
import GameReviewCard from "@/components/GameReviewCard";
import GameReviewCardSmall from "@/components/GameReviewCardSmall";
import GameReviewCardSkeleton from "@/components/GameReviewCardSkeleton";
import ReviewInputBox from "@/components/ReviewInputBox";
import { useAuthContext } from "@/context/AuthContext";
import { GamePageProps, GameReview } from "@/type/game";
import { getGenre } from "@/type/gameGenre";
import { getPlatform } from "@/type/gamePlatform";
import { DLCDefinition, EarlyAccessDefinition } from "@/utils/Definition";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import { getScoreColor } from "@/utils/DynamicScore";
import { getStoreIcons } from "@/utils/GameLinksIcons";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Modal,
  Select,
  Skeleton,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
  circularProgressClasses,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import { is } from "date-fns/locale";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "tailwindcss/tailwind.css";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gameid } = context.query;

  let game = null;
  let errorMessage = null;

  try {
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

function GamePage({ game, errorMessage }: GamePageProps) {
  const [reviewTypeValue, setReviewTypeValue] = useState(0);
  const [reviews, setReviews] = useState<null | GameReview[]>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recency" | "score">("recency");
  const { user, token, isUserLoading } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [userReview, setUserReview] = useState<GameReview | null>(null);
  const [isUserReviewLoading, setIsUserReviewLoading] = useState<boolean>(true);
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [favourited, setFavourited] = useState<boolean | null>(null);
  const [favouriteButtonDisabled, setFavouriteButtonDisabled] =
    useState<boolean>(false);
  const [wishlisted, setWishlisted] = useState<boolean | null>(null);
  const [wishlistButtonDisabled, setWishlistButtonDisabled] =
    useState<boolean>(false);

  const fetchUserReview = useCallback(async () => {
    if (game && user) {
      const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/hasUserReviewedGame`;
      const body = {
        gameId: game.id,
        reviewerId: user.id,
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
          setUserReview(await response.data);
        }
      } catch (error: any) {
        console.error(error);
      }
    }
    setIsUserReviewLoading(false);
  }, [game, user]);

  useEffect(() => {
    if (!isUserLoading) {
      fetchUserReview();
    }
  }, [fetchUserReview, user, game, token]);

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

  const favouriteGame = async (favourite: number, access_token: string) => {
    if (user === null) {
      displaySnackbarVariant(
        "You must be logged in to favourite a game.",
        "info"
      );
      return;
    }
    let result = null;
    const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/favourite`;
    const body = {
      id: user.id,
      favourite: favourite,
    };
    try {
      const response = await axios.post(apiAddress, body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.status === 200) {
        result = await response.data;
      }
    } catch (error: any) {
      console.error(error);
    }

    return result;
  };

  const wishlistGame = async (wishlist: number, access_token: string) => {
    if (user === null) {
      displaySnackbarVariant(
        "You must be logged in to wishlist a game.",
        "info"
      );
      return;
    }
    let result = null;
    const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/wishlist`;
    const body = {
      id: user.id,
      wishlist: wishlist,
    };
    try {
      const response = await axios.post(apiAddress, body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.status === 200) {
        result = await response.data;
      }
    } catch (error: any) {
      console.error(error);
    }

    return result;
  };

  useEffect(() => {
    if (game && user && user.favouriteGames) {
      setFavourited(
        user.favouriteGames.some((favGameId) => favGameId === Number(game.id))
      );
    }
    if (game && user && user.wishlistGames) {
      setWishlisted(
        user.wishlistGames.some((wishGameId) => wishGameId === Number(game.id))
      );
    }
  }, [game, user]);

  useEffect(() => {
    handleReviewFetch(
      reviewTypeValue === 0 ? null : reviewTypeValue === 1 ? true : false
    );
  }, [handleReviewFetch, reviewTypeValue, sortBy]);

  if (!game || errorMessage) {
    return (
      <Box
        sx={{
          display: "flex",
          padding: "24px 32px",
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          gap: "32px",
          overflowX: "hidden",
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Game Not Found
        </Typography>
        {/*
        {errorMessage && (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            {errorMessage}
          </Typography>
        )}
*/}
      </Box>
    );
  }

  return (
    <div>
      <Head>
        <title>{`${game.name} | CritiQ`}</title>
      </Head>
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
          height: "310px",
          position: "absolute",
          top: "0px",
        }}
      >
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
      </Box>

      <Box
        sx={{
          display: "flex",
          padding: "24px 32px",
          maxWidth: 1440,
          flexDirection: "column",
          flex: "1 0 0",
          margin: "0 auto",
          gap: "32px",
          
          [theme.breakpoints.down("md")]: {
            padding: "18px 16px",
            gap: "16px",
          },

          [theme.breakpoints.down("sm")]: {
            padding: "12px 12px",
            gap: "12px",
          },
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

            [theme.breakpoints.down("sm")]: {
              borderRadius: "12px 12px 48px 12px",
            },
          }}
        >
          <Box
            sx={{
              height: "516px",
              width: "100%",
              display: "flex",
              position: "relative",

              [theme.breakpoints.down("sm")]: {
                height: "366px",
                maxHeight: "36vh",
                minHeight: "266px",
              }
            }}
          >
            {game?.iconUrl ? (
              <Image
                loading={"lazy"}
                src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${game.iconUrl}`}
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
                <Typography variant={isTablet ? "h5" : "h3"} color="error">
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
                [theme.breakpoints.down("sm")]: {
                  padding: "12px 24px",
                }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "16px",
                  position: "absolute",
                  left: "42px",
                  top: "24px",
                  
                  [theme.breakpoints.down("sm")]: {
                    display: "none",
                  }
                }}
              >
                <Button
                  variant="contained"
                  color={favourited ? "error" : "success"}
                  size="large"
                  sx={{
                    borderRadius: "32px",
                    overflow: "hidden",
                    width: "fit-content",
                  }}
                  disabled={favouriteButtonDisabled}
                  onClick={async () => {
                    setFavouriteButtonDisabled(true);
                    const r = await favouriteGame(Number(game.id), token!)
                      .then((result) => {
                        setFavourited(result);
                        setFavouriteButtonDisabled(false);
                      })
                      .catch((error) => {
                        console.error(error);
                        setFavouriteButtonDisabled(true);
                      });
                  }}
                >
                  <Typography variant="h6" color="white">
                    {favourited && favourited === true
                      ? "UnFavourite"
                      : "Favourite"}
                  </Typography>
                </Button>
                <Button
                  variant="contained"
                  color={wishlisted ? "error" : "success"}
                  sx={{
                    borderRadius: "32px",
                    overflow: "hidden",
                    width: "fit-content",
                  }}
                  size="large"
                  disabled={wishlistButtonDisabled}
                  onClick={async () => {
                    setWishlistButtonDisabled(true);
                    const r = await wishlistGame(Number(game.id), token!)
                      .then((result) => {
                        setWishlisted(result);

                        setWishlistButtonDisabled(false);
                      })
                      .catch((error) => {
                        console.error(error);
                        setWishlistButtonDisabled(true);
                      });
                  }}
                >
                  <Typography variant="h6" color="white">
                    {user && wishlisted && wishlisted === true
                      ? "UnWishlist"
                      : "Wishlist"}
                  </Typography>
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  position: "absolute",
                  right: "42px",
                  
                  [theme.breakpoints.down("sm")]: {
                    right: "8px",
                    gap: "8px",
                  }
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  LinkComponent={Link}
                  href={`/games/analytics/${game.id}`}
                >
                  Analytics
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpen(true)}
                  sx={{
                    width: "fit-content",
                  }}
                >
                  more
                </Button>
                <Modal
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  open={open}
                >
                  <Box
                    sx={{
                      maxHeight: "100vh",
                      overflowY: "auto",
                    }}
                  >
                    <GameDetailBox game={game} setOpen={setOpen} />
                  </Box>
                </Modal>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  [theme.breakpoints.up("sm")]: {
                    right: "42px",
                    bottom: "24px",
                  },
                  [theme.breakpoints.down("sm")]: {
                    left: "8px",
                  },
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
                        padding: "8px 16px",
                        justifyContent: "center",
                        alignItems: "center",
                        [theme.breakpoints.down("sm")]: {
                          padding: "8px 12px",
                        }
                      })}
                    >
                      <Typography variant={isTablet ? "body2" : "h6"} color="background.default">
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

                  [theme.breakpoints.down("sm")]: {
                    left: "8px",
                    bottom: "12px",
                    gap: "8px",
                  },
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
                        [theme.breakpoints.down("md")]: {
                          padding: "8px 16px",
                          gap: "8px",
                        },
                        [theme.breakpoints.down("sm")]: {
                          padding: "4px 12px",
                        },
                      })}
                    >
                      <Typography variant={isTablet ? "subtitle1" : "h4"} color="background.default">
                        Early Access
                      </Typography>
                      <HelpOutlineIcon
                        sx={{
                          fontSize: "24px",
                          color: "background.default",
                          [theme.breakpoints.down("md")]: {
                            fontSize: "20px",
                          },
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
                          [theme.breakpoints.down("md")]: {
                            padding: "4px 12px",
                            gap: "4px",
                          },
                        })}
                      >
                        <Typography variant={isTablet ? "subtitle2" : "h5"} color="background.default">
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
            <Box
              sx={{
                position: "absolute",
                right: "8px",
                bottom: "8px",
                [theme.breakpoints.up("sm")]: {
                  display: "none"
                },
              }}
            >
              <CircularProgress
                variant="determinate"
                size={102}
                thickness={4}
                value={100}
                sx={(theme) => ({
                  color: theme.palette.divider,
                  opacity: 0.4,
                })}
              />
              <CircularProgress
                variant="determinate"
                size={102}
                thickness={4}
                value={game?.score ?? 0}
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
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  }}
                  color={
                    game.score
                      ? `${getScoreColor(game.percentile)}.main`
                      : "divider"
                  }
                >
                  {game.score ? Math.round(game.score).toString() : "N/A"}
                </Typography>
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
              [theme.breakpoints.down("md")]: {
                padding: "16px 24px",
                gap: "12px",
              },
              [theme.breakpoints.down("sm")]: {
                padding: "12px 16px",
                gap: "8px",
              },
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
                variant={isTablet? "h6" : "h4"}
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
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "center",
                gap: "8px",
                [theme.breakpoints.up("sm")]: {
                  display: "none",
                }
              }}
            >
              <Button
                variant="contained"
                color={favourited ? "error" : "success"}
                size="medium"
                sx={{
                  width: "fit-content",
                }}
                disabled={favouriteButtonDisabled}
                onClick={async () => {
                  setFavouriteButtonDisabled(true);
                  const r = await favouriteGame(Number(game.id), token!)
                    .then((result) => {
                      setFavourited(result);
                      setFavouriteButtonDisabled(false);
                    })
                    .catch((error) => {
                      console.error(error);
                      setFavouriteButtonDisabled(true);
                    });
                }}
              >
                <Typography variant="subtitle1" color="white">
                  {favourited && favourited === true
                    ? "UnFavourite"
                    : "Favourite"}
                </Typography>
              </Button>
              <Button
                variant="contained"
                color={wishlisted ? "error" : "success"}
                sx={{
                  width: "fit-content",
                }}
                size="medium"
                disabled={wishlistButtonDisabled}
                onClick={async () => {
                  setWishlistButtonDisabled(true);
                  const r = await wishlistGame(Number(game.id), token!)
                    .then((result) => {
                      setWishlisted(result);

                      setWishlistButtonDisabled(false);
                    })
                    .catch((error) => {
                      console.error(error);
                      setWishlistButtonDisabled(true);
                    });
                }}
              >
                <Typography variant="subtitle1" color="white">
                  {user && wishlisted && wishlisted === true
                    ? "UnWishlist"
                    : "Wishlist"}
                </Typography>
              </Button>
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
                  variant={isTablet? "body1" : "h6"}
                  color="text.primary"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    textOverflow: "ellipsis",
                    fontWeight: 500,
                    overflow: "hidden",
                    height: "100%",
                    wordBreak: "break-all",
                    [theme.breakpoints.down("md")]: {
                      WebkitLineClamp: 4,
                    },
                    [theme.breakpoints.down("sm")]: {
                      WebkitLineClamp: 6,
                    },
                  }}
                >
                  {`${game.description ?? "No Description"}`}
                </Typography>
                <Typography
                  variant={isTablet? "body2" : "subtitle1"}
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
                  variant={isTablet? "body2" : "subtitle1"}
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Released On: </b>
                  {`${
                    game?.releaseDate
                      ? format(new Date(game?.releaseDate), "yyyy-MM-dd")
                      : "Unknown"
                  }`}
                </Typography>
                <Typography
                  variant={isTablet? "body2" : "subtitle1"}
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
                  variant={isTablet? "body2" : "subtitle1"}
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Published By: </b>
                  {`${game?.publisher ? game?.publisher : "Unknown"}`}
                </Typography>
                <Typography
                  variant={isTablet? "body2" : "subtitle1"}
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  {game.gamePage != null && (
                    <div style={{ display: "flex", flex: "row" }}>
                      <b>Store Page(s):</b> &nbsp;
                      {getStoreIcons(game.gamePage)}
                    </div>
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  [theme.breakpoints.down("sm")]: {
                    display: "none",
                  },
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
                    color={
                      game.score
                        ? `${getScoreColor(game.percentile)}.main`
                        : "divider"
                    }
                  >
                    {game.score ? Math.round(game.score).toString() : "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "24px",
            [theme.breakpoints.down("md")]: {
              gap: "16px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "12px",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              flex: 1,
              [theme.breakpoints.down("md")]: {
                gap: "16px",
              },
              [theme.breakpoints.down("sm")]: {
                gap: "12px",
              },
            }}
          >
            <Divider textAlign="left" flexItem={true}>
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
                    variant={isTablet? "h6" : "h4"}
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
              variant={isTablet? "body2" : "subtitle1"}
              color="info.main"
              sx={{ fontWeight: 500 }}
            >
              COMING SOON....
            </Typography>
          </Box>
          {!isTablet && !game?.dlc && game?.dlcs && game?.dlcs.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ fontWeight: 700, textAlign: "center" }}
                >
                  DLC
                </Typography>
                <Box
                  sx={{
                    width: 576,
                    padding: 2,
                    display: "block",
                  }}
                >
                  <Slider
                    dots
                    infinite
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    draggable={false}
                    autoplay
                    autoplaySpeed={3000}
                    lazyLoad="ondemand"
                    cssEase="linear"
                    centerMode
                    centerPadding="12px"
                    nextArrow={<CustomArrowRight size="small" />}
                    prevArrow={<CustomArrowLeft size="small" />}
                  >
                    {game?.dlcs.map((dlc) => (
                      <Box key={dlc.id}>
                        <GameDLCCard game={dlc} />
                      </Box>
                    ))}
                  </Slider>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {isTablet && !game?.dlc && game?.dlcs && game?.dlcs.length > 0 && (
          <Box>
            <Divider textAlign="left">
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
                  variant="h6"
                  color="primary.main"
                  sx={{ fontWeight: 700 }}
                >
                  DLC
                </Typography>
              </Box>
            </Divider>

            <Box
              sx={{
                width: "90%",
                padding: "16px 0px",
                display: "block",
                margin: "auto",
              }}
            >
              <Slider
                dots
                infinite
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                draggable={false}
                autoplay
                autoplaySpeed={3000}
                lazyLoad="ondemand"
                cssEase="linear"
                nextArrow={<CustomArrowRight size="small" />}
                prevArrow={<CustomArrowLeft size="small" />}
              >
                {game?.dlcs.map((dlc) => (
                  isMobile ? <Box sx={{padding: "4px"}}key={dlc.id}><GameDLCCardSmall game={dlc} /></Box> : <Box key={dlc.id}><GameDLCCard key={dlc.id} game={dlc} /></Box>
                ))}
              </Slider>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            flex: 1,
            [theme.breakpoints.down("md")]: {
              gap: "16px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "12px",
            },
          }}
        >
          <a id="add-review">
            <Divider textAlign="left">
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
                  variant={isTablet? "h6" : "h4"}
                  color="secondary.main"
                  sx={{ fontWeight: 700 }}
                >
                  {`User Reviews (${game.numberOfReviews ?? 0})`}
                </Typography>
              </Box>
            </Divider>
          </a>
          
          {!isUserLoading && user && isUserReviewLoading ? (
            <Skeleton variant="rectangular" height={348} />
          ) : userReview ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                gap: "12px",
                width: "100%",
              }}
            >
              <Typography
                variant={isTablet? "subtitle1" : "h5"}
                color="secondary.main"
                sx={{ fontWeight: 500 }}
              >
                Your Review
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Edit review feature is not available yet.
              </Typography>
              {isTablet ? <GameReviewCardSmall review={userReview} fullWidth={true} />: <GameReviewCard review={userReview} fullWidth={true} />}
            </Box>
          ) : user ? (
            <ReviewInputBox user={user} game={game} size={isTablet ? "small" : "normal"} />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "12px",
                width: "100%",
              }}
            >
              <Typography
                variant={isTablet? "body2" : "body1"}
                color="secondary"
                sx={{ fontWeight: 500 }}
              >
                Sign in to write a new review
              </Typography>
              <Button
                variant="outlined"
                LinkComponent={Link}
                href="/login"
                color="secondary"
              >
                Log in
              </Button>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "12px",
              
              [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
                gap: "4px",
                alignItems: "flex-end",
              },
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
              <Tab label="All Reviews" />
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
            <Grid container rowSpacing={{ xs: 2, lg: 4 }} columnSpacing={2}>
              <Grid item xs={12} lg={6}>
                <GameReviewCardSkeleton />
              </Grid>
              <Grid item xs={12} lg={6}>
                <GameReviewCardSkeleton />
              </Grid>
            </Grid>
          ) : reviews && reviews.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                width: "100%",
              }}
            >
              <Grid container rowSpacing={{ xs: 2, lg: 4 }} columnSpacing={2}>
                {reviews.map((review) => (
                  <Grid item xs={12} lg={6} key={review.id}>
                    {isTablet ? <GameReviewCardSmall review={review} /> : <GameReviewCard review={review} />}
                  </Grid>
                ))}
              </Grid>
              {game.numberOfReviews != null && game.numberOfReviews > 12 && (
                <Button
                  variant="contained"
                  color="secondary"
                  LinkComponent={Link}
                  href={`/games/${game.id}/reviews`}
                  size="large"
                  sx={{
                    width: "fit-content",
                    alignSelf: "center",
                  }}
                >
                  View More Reviews
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Typography
                variant={isTablet? "body2" : "subtitle1"}
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

