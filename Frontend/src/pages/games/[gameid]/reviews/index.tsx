import GameReviewCard from "@/components/GameReviewCard";
import GameReviewCardSkeleton from "@/components/GameReviewCardSkeleton";
import { GamePageProps, GameReview } from "@/type/game";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

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

const fetchReview = async (
  gameId: string,
  recommended: boolean | null,
  sortBy: "recency" | "score",
  reviewsPerPage: number,
  pageNum: number
) => {
  let review = null;
  let numberOfReviews = 0;
  const apiAddress = `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewsByGameIdPaged`;
  const body = {
    gameId: gameId,
    reviewsPerPage: reviewsPerPage,
    pageNum: pageNum,
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
      const result = await response.data;
      review = result.content;
      numberOfReviews = result.totalElements;
    }
  } catch (error: any) {
    console.error(error);
  }

  return [review, numberOfReviews];
};

function GameReviewPage({ game, errorMessage }: GamePageProps) {
  const [reviewTypeValue, setReviewTypeValue] = useState(0);
  const [sortBy, setSortBy] = useState<"recency" | "score">("recency");
  const [reviews, setReviews] = useState<null | GameReview[]>(null);
  const [reviewsPerPage, setReviewsPerPage] = useState<number>(12);
  const [pageNum, setPageNum] = useState<number>(0);
  const [numberOfReviews, setNumberOfReviews] = useState<number | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    scrollToTop();
    setPageNum(value - 1);
  };

  const handleReviewTypeChange = (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    setPageNum(0);
    setReviewTypeValue(newValue);
  };

  const handleReviewFetch = useCallback(
    async (recommended: boolean | null) => {
      if (game?.id) {
        setIsReviewLoading(true);
        const reviews = await fetchReview(
          game?.id,
          recommended,
          sortBy,
          reviewsPerPage,
          pageNum
        );
        setReviews(reviews[0]);
        setNumberOfReviews(reviews[1]);
        setIsReviewLoading(false);
      }
    },
    [game?.id, pageNum, reviewsPerPage, sortBy]
  );

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
          gap: 4,
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Game Not Found
        </Typography>
      </Box>
    );
  }

  return (
    <div>
      <Head>
        <title>{`${game.name} user reviews | CritiQ`}</title>
      </Head>

      <Box
        sx={{
          display: "flex",
          padding: "48px 32px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "32px",
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",

          [theme.breakpoints.down("sm")]: {
            padding: "12px 12px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
          }}
        >
          {numberOfReviews == null ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                [theme.breakpoints.down("md")]: {
                  flexDirection: "column",
                  gap: "8px",
                },
                [theme.breakpoints.down("sm")]: {
                  flexDirection: "row",
                  gap: "0px",
                },
              }}
            >
              <Skeleton
                variant="rectangular"
                width={300}
                height={60}
                sx={{ alignSelf: "flex-start" }}
              />
              <Skeleton
                variant="rectangular"
                width={125}
                height={60}
                sx={{ alignSelf: "flex-end" }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                [theme.breakpoints.down("md")]: {
                  flexDirection: "column",
                  gap: "8px",
                },
                [theme.breakpoints.down("sm")]: {
                  flexDirection: "row",
                  gap: "0px",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  alignSelf: "flex-start",
                  [theme.breakpoints.down("sm")]: {
                    gap: "4px",
                    flexDirection: "column",
                  },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  component="div"
                  sx={{
                    color: "text.secondary",
                    [theme.breakpoints.down("sm")]: {
                      textAlign: "left",
                      padding: "0px 6px",
                      width: "100%",
                    },
                  }}
                >
                  {`${numberOfReviews} Review`}
                  {numberOfReviews > 1 ? "s" : ""}
                  {` for`}
                </Typography>
                <Button
                  variant="text"
                  LinkComponent={Link}
                  href={`/games/${game.id}`}
                >
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    component="div"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    {game.name}
                  </Typography>
                </Button>
              </Box>
              <FormControl sx={{ minWidth: 124, alignSelf: "flex-end" }}>
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
          )}
          <Divider flexItem={true} />

          {numberOfReviews == null ? (
            <Box sx={{ width: "100%" }}>
              <Skeleton
                variant="rectangular"
                height={48}
                sx={{ alignSelf: "flex-start", width: "100%" }}
              />
            </Box>
          ) : (
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
          )}
          {isReviewLoading || numberOfReviews == null ? (
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
                alignItems: "center",
                gap: "12px",
                minHeight: "50vh",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Grid container rowSpacing={{ xs: 2, lg: 4 }} columnSpacing={2}>
                {reviews.map((review) => (
                  <Grid item xs={12} lg={6} key={review.id}>
                    <GameReviewCard review={review} />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ width: "100%" }}>
                <Pagination
                  color="primary"
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  count={Math.ceil(numberOfReviews / reviewsPerPage)}
                  page={pageNum + 1}
                  onChange={handlePageChange}
                  sx={{
                    "& .MuiPagination-ul": {
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                color="secondary.main"
                sx={{ fontWeight: 500, textAlign: "center" }}
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

export default GameReviewPage;

