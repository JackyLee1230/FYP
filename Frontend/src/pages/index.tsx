import { GameInfo } from "@/type/game";
import { Box, Button, Divider, Skeleton, Typography, alpha, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import GameCarousel from "@/components/Carousel/GameCarousel";
import { EmblaOptionsType } from "embla-carousel-react";
import { set } from "lodash";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

const getTopRecentlyReleasedGames = async (numOfGames: number) => {
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getTopRecentlyReleasedGames`;
  const body = {
    numOfGames: numOfGames,
  }
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
      return response.data;
    }
  } catch (error: any) {
    console.error(error);
  }
}

const getTopMostReviewedInDevelopmentGames = async (numOfGames: number) => {
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getTopMostReviewedInDevelopmentGame`;
  const body = {
    numOfGames: numOfGames,
  }
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
      return response.data;
    }
  } catch (error: any) {
    console.error(error);
  }
} 

const getTopMostReviewedGames = async (numOfGames: number) => {
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getTopMostReviewedGames`;
  const body = {
    numOfGames: numOfGames,
  }
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
      return response.data;
    }
  } catch (error: any) {
    console.error(error);
  }
}

const getTopMostFavouritedGames = async (numOfGames: number) => {
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getTopFavouritedGames`;
  const body = {
    numOfGames: numOfGames,
  }
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
      return response.data;
    }
  } catch (error: any) {
    console.error(error);
  }
}

const getTopMostWishlistedGames = async (numOfGames: number) => {
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/getTopWishlistedGames`;
  const body = {
    numOfGames: numOfGames,
  }
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
      return response.data;
    }
  } catch (error: any) {
    console.error(error);
  }
}

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const numOfGames = 20;
  const [recentlyReleasedGames, setRecentlyReleasedGames] = useState<GameInfo[]>([]);
  const [isRecentlyReleasedGamesLoading, setIsRecentlyReleasedGamesLoading] = useState<boolean>(true);
  const [mostReviewedInDevelopmentGames, setMostReviewedInDevelopmentGames] = useState<GameInfo[]>([]);
  const [isMostReviewedInDevelopmentGamesLoading, setIsMostReviewedInDevelopmentGamesLoading] = useState<boolean>(true);
  const [mostReviewedGames, setMostReviewedGames] = useState<GameInfo[]>([]);
  const [isMostReviewedGamesLoading, setIsMostReviewedGamesLoading] = useState<boolean>(true);
  const [mostFavouritedGames, setMostFavouritedGames] = useState<GameInfo[]>([]);
  const [isMostFavouritedGamesLoading, setIsMostFavouritedGamesLoading] = useState<boolean>(true);
  const [mostWishlistedGames, setMostWishlistedGames] = useState<GameInfo[]>([]);
  const [isMostWishlistedGamesLoading, setIsMostWishlistedGamesLoading] = useState<boolean>(true);
  useEffect(() => {
    getTopRecentlyReleasedGames(numOfGames).then((data) => {
      setRecentlyReleasedGames(data);
      setIsRecentlyReleasedGamesLoading(false);
    }).catch(() => {
      setIsRecentlyReleasedGamesLoading(false);
    });

    getTopMostReviewedInDevelopmentGames(numOfGames).then((data) => {
      setMostReviewedInDevelopmentGames(data);
      setIsMostReviewedInDevelopmentGamesLoading(false);
    }).catch(() => {
      setIsMostReviewedInDevelopmentGamesLoading(false);
    });

    getTopMostReviewedGames(numOfGames).then((data) => {
      setMostReviewedGames(data);
      setIsMostReviewedGamesLoading(false);
    }).catch(() => {
      setIsMostReviewedGamesLoading(false);
    });

    getTopMostFavouritedGames(numOfGames).then((data) => {
      setMostFavouritedGames(data);
      setIsMostFavouritedGamesLoading(false);
    }).catch(() => {
      setIsMostFavouritedGamesLoading(false);
    });
    getTopMostWishlistedGames(numOfGames).then((data) => {
      setMostWishlistedGames(data);
      setIsMostWishlistedGamesLoading(false);
    }).catch(() => {
      setIsMostWishlistedGamesLoading(false);
    });
  }, []);

  const OPTIONS: EmblaOptionsType = { 
    slidesToScroll: 'auto',
    watchDrag: isMobile ? true : false,
    dragFree: isMobile ? true : false,
  }

  return (
    <>
      <Head>
        <title>
          CritiQ - Game Testing and Evaluation Platform with Machine Learning
          for Game Developers
        </title>
      </Head>
      <Box
          sx={{
            position: "absolute",
            height: "216px",
            width: "100%",
            top: 0,
            bgcolor: alpha(theme.palette.secondary.main, 0.65),
            borderRadius: "0 0 100% 100% / 0 0 50% 50%",
            [theme.breakpoints.down("md")]: {
              height: "188px",
              borderRadius: "0 0 100% 100% / 0 0 25% 25%",
            },
            [theme.breakpoints.down("sm")]: {
              height: "146px",
              borderRadius: "0 0 100% 100% / 0 0 15% 15%",
            },
          }}
        />
      <Box
        sx={(theme) => ({
          display: "flex",
          padding: "48px 32px",
          gap: "48px",
          maxWidth: 1440,
          flexDirection: "column",
          flex: "1 0 0",
          margin: "0 auto",
          position: "relative",

          [theme.breakpoints.down("md")]: {
            padding: "24px 16px",
            gap: "36px",
          },

          [theme.breakpoints.down("sm")]: {
            padding: "12px 12px",
            gap: "24px",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Image src="/logo.png" width={isMobile ? 248 : 330} height={isMobile ? 75 : 100} alt="CritiQ Icon" />
            <Typography variant={isMobile? "subtitle1" : "h6"} color="primary">
              Revolutionary Game Testing and Evaluation Platform with Machine Learning
            </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            [theme.breakpoints.down("md")]: {
              gap: "32px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "16px",
            },
          }}
        
        >
          <Box
            id="LatestGames"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "24px",
                width: "100%",
                [theme.breakpoints.down("sm")]: {
                  gap: "4px",
                },
              }}
            >
              <Typography variant={isMobile? "h6" : "h5"} color="text.primary">
                Latest Releases
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                href={`/result`}
                LinkComponent={Link}
              >
                View All Games
              </Button>
            </Box>
            <Divider flexItem/>
            {isRecentlyReleasedGamesLoading ? (
              <Skeleton variant="rectangular"
                sx={{
                  width: "100%",
                  height: "375px",
                  [theme.breakpoints.down("md")]: {
                    height: "345px"
                  },
                  [theme.breakpoints.down("sm")]: {
                    height: "285px"
                  }
                }}
              />
            ): (
              recentlyReleasedGames && recentlyReleasedGames.length !== 0 ? (
                <GameCarousel gameList={recentlyReleasedGames} options={OPTIONS}/>
              ) : (
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="error.main"
                  sx={{
                    height: "375px",
                    [theme.breakpoints.down("md")]: {
                      height: "345px",
                    },
                    [theme.breakpoints.down("sm")]: {
                      height: "285px",
                    },
                  }}
                >
                  Not Available
                </Typography>
              )
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            [theme.breakpoints.down("md")]: {
              gap: "32px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "16px",
            },
          }}
        
        >
          <Box
            id="LatestGames"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                width: "100%",
              }}
            >
              <Typography variant={isMobile? "h6" : "h5"} color="text.primary">
                Most Reviewed Early Access Titles
              </Typography>
              <Typography variant={isMobile? "subtitle2" : "subtitle1"} color="text.secondary">
                Play the future today! Join the buzz and share your thoughts on these popular in development games.
              </Typography>
            </Box>
            <Divider flexItem/>
            {isMostReviewedInDevelopmentGamesLoading ? (
              <Skeleton variant="rectangular"
                sx={{
                  width: "100%",
                  height: "375px",
                  [theme.breakpoints.down("md")]: {
                    height: "345px"
                  },
                  [theme.breakpoints.down("sm")]: {
                    height: "285px"
                  }
                }}
              />
            ): (
              mostReviewedInDevelopmentGames && mostReviewedInDevelopmentGames.length !== 0 ? (
                <GameCarousel gameList={mostReviewedInDevelopmentGames} options={OPTIONS}/>
              ) : (
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="error.main"
                  sx={{
                    height: "375px",
                    [theme.breakpoints.down("md")]: {
                      height: "345px",
                    },
                    [theme.breakpoints.down("sm")]: {
                      height: "285px",
                    },
                  }}
                >
                  Not Available
                </Typography>
              )
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            [theme.breakpoints.down("md")]: {
              gap: "32px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "16px",
            },
          }}
        
        >
          <Box
            id="LatestGames"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                width: "100%",
              }}
            >
              <Typography variant={isMobile? "h6" : "h5"} color="text.primary">
                Most Reviewed Game
              </Typography>
              <Typography variant={isMobile? "subtitle2" : "subtitle1"} color="text.secondary">
                Join the conversation now! These games have sparked the most discussions among players.
              </Typography>
            </Box>
            <Divider flexItem/>
            {isMostReviewedGamesLoading ? (
              <Skeleton variant="rectangular"
                sx={{
                  width: "100%",
                  height: "375px",
                  [theme.breakpoints.down("md")]: {
                    height: "345px"
                  },
                  [theme.breakpoints.down("sm")]: {
                    height: "285px"
                  }
                }}
              />
            ): (
              mostReviewedGames && mostReviewedGames.length !== 0 ? (
                <GameCarousel gameList={mostReviewedGames} options={OPTIONS}/>
              ) : (
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="error.main"
                  sx={{
                    height: "375px",
                    [theme.breakpoints.down("md")]: {
                      height: "345px",
                    },
                    [theme.breakpoints.down("sm")]: {
                      height: "285px",
                    },
                  }}
                >
                  Not Available
                </Typography>
              )
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            [theme.breakpoints.down("md")]: {
              gap: "32px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "16px",
            },
          }}
        
        >
          <Box
            id="LatestGames"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                width: "100%",
              }}
            >
              <Typography variant={isMobile? "h6" : "h5"} color="text.primary">
                Most Favourited Game
              </Typography>
              <Typography variant={isMobile? "subtitle2" : "subtitle1"} color="text.secondary">
                Loved by many, these games have won the hearts of players!
              </Typography>
            </Box>
            <Divider flexItem/>
            {isMostFavouritedGamesLoading ? (
              <Skeleton variant="rectangular"
                sx={{
                  width: "100%",
                  height: "375px",
                  [theme.breakpoints.down("md")]: {
                    height: "345px"
                  },
                  [theme.breakpoints.down("sm")]: {
                    height: "285px"
                  }
                }}
              />
            ): (
              mostFavouritedGames && mostFavouritedGames.length !== 0 ? (
                <GameCarousel gameList={mostFavouritedGames} options={OPTIONS}/>
              ) : (
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="error.main"
                  sx={{
                    height: "375px",
                    [theme.breakpoints.down("md")]: {
                      height: "345px",
                    },
                    [theme.breakpoints.down("sm")]: {
                      height: "285px",
                    },
                  }}
                >
                  Not Available
                </Typography>
              )
            )}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "48px",
            [theme.breakpoints.down("md")]: {
              gap: "32px",
            },
            [theme.breakpoints.down("sm")]: {
              gap: "16px",
            },
          }}
        
        >
          <Box
            id="LatestGames"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
                width: "100%",
              }}
            >
              <Typography variant={isMobile? "h6" : "h5"} color="text.primary">
                Most Wishlisted Game
              </Typography>
              <Typography variant={isMobile? "subtitle2" : "subtitle1"} color="text.secondary">
                Can’t wait to play? You’re not alone! These are the games everyone’s eager to get their hands on.
              </Typography>
            </Box>
            <Divider flexItem/>
            {isMostWishlistedGamesLoading ? (
              <Skeleton variant="rectangular"
                sx={{
                  width: "100%",
                  height: "375px",
                  [theme.breakpoints.down("md")]: {
                    height: "345px"
                  },
                  [theme.breakpoints.down("sm")]: {
                    height: "285px"
                  }
                }}
              />
            ): (
              mostWishlistedGames && mostWishlistedGames.length !== 0 ? (
                <GameCarousel gameList={mostWishlistedGames} options={OPTIONS}/>
              ) : (
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="error.main"
                  sx={{
                    height: "375px",
                    [theme.breakpoints.down("md")]: {
                      height: "345px",
                    },
                    [theme.breakpoints.down("sm")]: {
                      height: "285px",
                    },
                  }}
                >
                  Not Available
                </Typography>
              )
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;

