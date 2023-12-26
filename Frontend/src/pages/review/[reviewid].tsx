import { GameReviewPageProps } from "@/type/game";
import { getGenre } from "@/type/gameGenre";
import { getPlatform } from "@/type/gamePlatform";
import { formatTime } from "@/utils/StringUtils";
import axios from "axios";
import { format } from "date-fns";
import { GetServerSideProps } from "next";
import Head from "next/head";
import "tailwindcss/tailwind.css";
import Image from "next/image";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  ButtonBase,
  Divider,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HelpIcon from "@mui/icons-material/Help";
import Link from "next/link";
import { playTimeString } from "@/utils/Other";
import { getReviewColor } from "@/utils/DynamicScore";
import Collapse from "@mui/material/Collapse";
import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { CustomArrowLeft, CustomArrowRight } from "@/components/CustomArrows";
import ScrollToTopFab from "@/components/ScrollToTopFAB";
import { useAuthContext } from "@/context/AuthContext";
import {
  displaySnackbar,
  displaySnackbarVariant,
} from "@/utils/DisplaySnackbar";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

const NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX =
  process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { reviewid } = context.query;

  let review = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewById`,
      { reviewId: reviewid },
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
      review = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      review,
      errorMessage,
      iconUrl,
    },
  };
};

const StyledBrokenImageIcon = styled(BrokenImageIcon)(({ theme }) => ({
  fontSize: 82,
  color: theme.palette.error.main,
}));

const StyledThumbUpIcon = styled(ThumbUpIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: 32,
}));

const StyledThumbDownIcon = styled(ThumbDownIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: 32,
}));

const StyledHelpIcon = styled(HelpIcon)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: 24,
}));

const StyledArrowDropDownIcon = styled(ArrowDropDownIcon)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: 24,
}));

const StyledArrowDropUpIcon = styled(ArrowDropUpIcon)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: 24,
}));

function GamePage({ review, errorMessage }: GameReviewPageProps) {
  const [showMLSummaries, setShowMLSummaries] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [disliked, setDisliked] = useState<boolean | null>(null);
  const [newLikes, setNewLikes] = useState<number>(review?.numberOfLikes ?? 0);
  const [newDislikes, setNewDislikes] = useState<number>(
    review?.numberOfDislikes ?? 0
  );

  const { user, token } = useAuthContext();

  useEffect(() => {
    if (user != null) {
      setLiked(review?.likedUsers?.includes(user?.id) ?? null);
      setDisliked(review?.dislikedUsers?.includes(user?.id) ?? null);
    }
  }, [user]);

  const handleReaction = async (newReaction: boolean | null) => {
    if (newReaction === null) {
      return;
    }

    if (user == null || token == null) {
      return;
    }

    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/reaction`,
      {
        reviewId: review!.id,
        likerId: user!.id,
        reaction: newReaction == true ? "LIKE" : "DISLIKE",
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const updatedReactionData = await response.data;
      setLiked(updatedReactionData.like);
      setDisliked(updatedReactionData.dislike);
      setNewLikes(updatedReactionData.likeCount);
      setNewDislikes(updatedReactionData.dislikeCount);
    } else {
      displaySnackbarVariant(response.statusText, "error");
      errorMessage = response.statusText;
    }
  };

  if (!review || errorMessage) {
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
          Review Not Found
        </Typography>
        {errorMessage && (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    );
  }

  const breadcrumbs = [
    <Button
      key="1"
      color="inherit"
      href={`/games/${review?.reviewedGame?.id}`}
      sx={{
        textDecoration: "none",
        textTransform: "none",
        "&:hover": { textDecoration: "underline" },
        justifyContent: "flex-start",
      }}
      LinkComponent={Link}
      variant="text"
    >
      <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
        {review?.reviewedGame?.name}
      </Typography>
    </Button>,
    <Typography key="2" variant="h6" color="text.secondary">
      {`Review by ${review?.reviewer?.name}`}
    </Typography>,
  ];

  return (
    <div>
      <Head>
        <title>
          {review.reviewedGame.name} Review: {review.reviewer.name} | CritiQ
        </title>
      </Head>

      <Box
        sx={{
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          display: "flex",
          padding: "24px 32px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "32px",
          alignSelf: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "24px 32px",
            alignItems: "center",
            gap: "24px",
            alignSelf: "stretch",
            borderRadius: "16px",
            bgcolor: "background.paper",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <ButtonBase
            LinkComponent={Link}
            href={`/games/${review.reviewedGame.id}`}
            sx={{
              height: "118px",
              width: "118px",
              display: "flex",
              position: "relative",
              borderRadius: "4px",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              flexShrink: 0,
              bgcolor: "grey.100",
            }}
          >
            {review?.reviewedGame?.iconUrl ? (
              <Image
                loading={"lazy"}
                src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewedGame?.iconUrl}`}
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
                <Typography variant="h6" color="error">
                  No Icon
                </Typography>
              </Box>
            )}
          </ButtonBase>

          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {breadcrumbs}
          </Breadcrumbs>
        </Box>

        <Box
          sx={{
            display: "flex",
            padding: "24px 32px",
            gap: "24px",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "stretch",
            borderRadius: "8px",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flex: "1 0 0",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flex: "1 0 0",
                alignSelf: "center",
              }}
            >
              <ButtonBase
                LinkComponent={Link}
                href={`/user/${review.reviewer.id}`}
                sx={{ borderRadius: "50%", bgcolor: "grey.100" }}
                disabled={!review?.reviewer?.id}
              >
                <Avatar
                  alt="Reviewer Avatar Icon"
                  src={
                    review?.reviewer?.iconUrl != null
                      ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewer?.iconUrl}`
                      : "/static/images/avatar/1.jpg"
                  }
                  sx={{ width: 96, height: 96 }}
                />
              </ButtonBase>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <Button
                  sx={{
                    textDecoration: "none",
                    textTransform: "none",
                    "&:hover": { textDecoration: "underline" },
                    justifyContent: "flex-start",
                    padding: 0,
                  }}
                  LinkComponent={Link}
                  variant="text"
                  href={`/user/${review.reviewer.id}`}
                  disabled={!review?.reviewer?.id}
                >
                  <Typography
                    variant="h4"
                    color="text.primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {review?.reviewer?.name ?? "Unknown User"}
                  </Typography>
                </Button>
                <Typography variant="subtitle1" color="text.secondary">
                  {`Posted on: ${
                    review?.createdAt != null
                      ? format(new Date(review?.createdAt), "yyyy-MM-dd")
                      : "Unknown Date"
                  }`}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "8px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary">
                    {review?.playTime != null && review?.playTime > 1
                      ? `Played for: ${playTimeString(review.playTime)},`
                      : "Played for: Unknown,"}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {review?.platform != null
                      ? `Platform: ${getPlatform(review?.platform)},`
                      : "Platform: Unknown,"}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {review?.gameVersion != null
                      ? `Version: ${review?.gameVersion}`
                      : "Version: Unknown"}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  gap: "8px",
                  alignSelf: "stretch",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {review?.recommended ? (
                    <>
                      <StyledThumbUpIcon />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#4FA639" }}
                      >
                        Recommended
                      </Typography>
                    </>
                  ) : (
                    <>
                      <StyledThumbDownIcon />
                      <Typography
                        variant="h6"
                        color="error.main"
                        sx={{ fontWeight: 700 }}
                      >
                        Not Recommended
                      </Typography>
                    </>
                  )}
                </Box>
                <Box
                  sx={{
                    borderRadius: "50%",
                    display: "flex",
                    width: "78px",
                    height: "78px",
                    alignItems: "center",
                  }}
                  bgcolor={`${getReviewColor(review?.score)}.main`}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                      width: "100%",
                      textAlign: "center",
                    }}
                    color="white"
                  >
                    {Math.round(review?.score)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Divider flexItem />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              alignSelf: "stretch",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                alignSelf: "center",
              }}
            >
              <Typography variant="overline" color="info.main">
                This section is generated by CritiQ automatically
              </Typography>
              <Tooltip title="This section is not part of the review. It is here to help you understand the review better.">
                <StyledHelpIcon />
              </Tooltip>
            </Box>
            <Collapse
              in={showMLSummaries}
              sx={{ margin: "12px 0px", width: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  alignSelf: "stretch",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "18px",
                    marginBottom: "12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 700, width: "132px" }}
                    >
                      AI Sentiment:
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Coming soon...
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 700, width: "132px" }}
                    >
                      Main Topics:
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Coming soon...
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 700, width: "132px" }}
                    >
                      Key Words:
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Coming soon...
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      sx={{ fontWeight: 700, width: "132px" }}
                    >
                      Summary:
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Coming soon...
                    </Typography>
                  </Box>
                </Box>
                {/*
                  <Box
                    sx={{
                      display: "flex",
                      padding: "4px 8px",
                      alignItems: "center",
                      gap: "24px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: "secondary.main",
                      alignSelf: "center",
                      width: "fit-content"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Typography variant="subtitle2" color="secondary.main" gutterBottom={false}>
                        Was this summaries helpful?
                      </Typography>
                      <Button variant="outlined" color="secondary" size="small">
                        YES
                      </Button>
                      <Button variant="outlined" color="secondary" size="small">
                        NO
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Typography variant="subtitle2" color="secondary.main" gutterBottom={false}>
                        The summaries are not accurate?
                      </Typography>
                      <Button variant="text" color="secondary" sx={{textDecoration: "underline"}} size="small">
                        Submit a report
                      </Button>
                    </Box>
                  </Box>
                */}
              </Box>
            </Collapse>
            <Button
              variant="outlined"
              color="info"
              onClick={() => setShowMLSummaries(!showMLSummaries)}
              sx={{
                alignSelf: "center",
              }}
            >
              {showMLSummaries ? (
                <StyledArrowDropUpIcon />
              ) : (
                <StyledArrowDropDownIcon />
              )}
            </Button>
          </Box>
          <Divider flexItem />
          <Box
            sx={{
              display: "flex",
              alignSelf: "stretch",
            }}
          >
            <Typography
              variant="h6"
              color="text.primary"
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {review?.comment ?? "This review has no comment."}
            </Typography>
          </Box>
          {review?.reviewImages?.length > 0 && (
            <>
              <Box
                sx={{
                  maxWidth: "1168px",
                  margin: "0 auto",
                  marginBottom: "24px",
                }}
              >
                <Slider
                  dots
                  dotsClass="slick-dots slick-thumb"
                  infinite
                  speed={500}
                  slidesToShow={1}
                  slidesToScroll={1}
                  variableWidth
                  autoplay
                  autoplaySpeed={3000}
                  lazyLoad="ondemand"
                  cssEase="linear"
                  centerMode
                  centerPadding="32px"
                  adaptiveHeight
                  nextArrow={<CustomArrowRight size="medium" />}
                  prevArrow={<CustomArrowLeft size="medium" />}
                  /* 
                    customPaging={(i) => (
                      <div key={i} style={{position: "relative"}}>
                        <Image
                          loading={"lazy"}
                          src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewImages[i]}`}
                          alt="Review Image"
                          width={178}
                          height={100}
                          style={{
                            objectFit: "none",
                          }}
                        />
                      </div>
                    )}
                  */
                >
                  {review?.reviewImages?.map((image) => (
                    <div key={image} style={{ position: "relative" }}>
                      <Image
                        loading={"lazy"}
                        src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${image}`}
                        alt="Review Image"
                        width={1000}
                        height={568}
                        style={{
                          objectFit: "none",
                          margin: "0px 32px",
                        }}
                      />
                    </div>
                  ))}
                </Slider>
              </Box>
            </>
          )}
          <Divider flexItem />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              alignSelf: "stretch",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Typography
                variant="subtitle1"
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                Did you find this review helpful?
              </Typography>
              <Button
                variant={
                  liked != null && liked == true ? "contained" : "outlined"
                }
                color="primary"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                  onClick={() => handleReaction(true)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <StyledThumbUpIcon sx={{ fontSize: 24 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#4FA639" }}
                    >
                      {newLikes ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2">YES</Typography>
                </Box>
              </Button>
              <Button
                variant={
                  disliked != null && disliked == true
                    ? "contained"
                    : "outlined"
                }
                color="primary"
                onClick={() => handleReaction(false)}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <StyledThumbDownIcon sx={{ fontSize: 24 }} />
                    <Typography
                      variant="subtitle1"
                      color="error.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {newDislikes ?? 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2">NO</Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      <ScrollToTopFab />

      {/* 
      <h1 className="text-4xl font-bold mb-4">
        Review for {review.reviewedGame.name} by {review.reviewer.name}
      </h1>
      <p className="text-lg mb-4">Created At: {formatTime(review.createdAt)}</p>
      <p className="text-lg mb-4">Score: {review.score}</p>
      <p className="text-lg mb-4">
        Recommended: {review.recommended ? "Yes" : "No"}
      </p>
      <p className="text-lg mb-4">Comment: {review.comment}</p>
      <p className="text-lg mb-4">
        Recommendation Score: {review.recommendationScore}
      </p>
      <p className="text-lg mb-4">Game Version: {review.gameVersion}</p>
      <p className="text-lg mb-4">AI Sentiment: {review.sentiment}</p>
      <p className="text-lg mb-4">
        Sentiment Updated At:{" "}
        {format(new Date(review.sentimentUpdatedAt), "yyyy-MM-dd HH:mm:ss")}
      </p>
      <p className="text-lg mb-4">
        Platforms:{" "}
        {review.reviewedGame.platforms.map((platform) => (
          <span key={platform}>{getPlatform(platform)} </span>
        ))}
      </p>
      <p className="text-lg mb-4">
        In Development: {review.inDevelopment ? "Yes" : "No"}
      </p>
      <p className="text-lg mb-4">
        Genres:{" "}
        {review.reviewedGame.genre.map((genre) => (
          <span key={genre}>{getGenre(genre)} </span>
        ))}
      </p>
      {review.reviewImages && review.reviewImages.length > 0 && (
        <>
          Review contains the following images:
          {review.reviewImages.map((image) => (
            <Image
              width={100}
              height={100}
              alt="Review Image"
              key={image}
              src={`${NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${image}`}
            />
          ))}
        </>
      )}
      */}
    </div>
  );
}

export default GamePage;

