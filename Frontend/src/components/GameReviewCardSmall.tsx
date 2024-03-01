import { GameReview } from "../type/game";
import { getPlatform } from "@/type/gamePlatform";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  styled,
  Button,
  ButtonBase,
} from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ImageIcon from "@mui/icons-material/Image";
import { getReviewColor } from "@/utils/DynamicScore";
import { format } from "date-fns";
import { playTimeString } from "@/utils/Other";
import { is } from "date-fns/locale";

type GameReviewCardProps = {
  review: GameReview;
  fullWidth?: boolean;
  mode?: "user" | "game";
};

const StyledThumbUpIcon = styled(ThumbUpIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: 24,
}));

const StyledThumbDownIcon = styled(ThumbDownIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: 24,
}));

const StyledCommentIcon = styled(CommentIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 18,
}));

const StyledImageIcon = styled(ImageIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 18,
}));

function GameReviewCardSmall({
  review,
  fullWidth,
  mode = "user",
}: GameReviewCardProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        borderRadius: "12px",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        flex: "1 0 0",
        minHeight: 300,
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "12px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "52px",
            justifyContent: "space-between",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              alignSelf: "stretch",
            }}
          >
            <ButtonBase
              LinkComponent={Link}
              href={`/games/${review?.reviewedGame.id}`}
              sx={{ borderRadius: "6%", bgcolor: "grey.100" }}
              disabled={!review?.reviewedGame.id}
            >
              <Avatar
                alt="Game Icon"
                src={
                  mode === "game" ?
                    review?.reviewedGame?.iconUrl != null
                      ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewedGame?.iconUrl}`
                      : "/static/images/avatar/1.jpg"
                    : review?.reviewer?.iconUrl != null
                      ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewer?.iconUrl}`
                      : "/static/images/avatar/1.jpg"
                }
                sx={{ width: 50, height: 50 }}
                variant="rounded"
              />
            </ButtonBase>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
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
                href={mode === "game" ? `/games/${review?.reviewedGame.id}` : `/user/${review?.reviewer?.id}`}
                disabled={mode === "game" ? !review?.reviewedGame.id : !review?.reviewer?.id}
              >
                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{ fontWeight: 700 }}
                >
                  {mode === "game" ? review.reviewedGame?.name ?? "Unknown Game" : review?.reviewer?.name ?? "Unknown User"}
                </Typography>
              </Button>

              <Typography variant="caption" color="text.secondary">
                {/* format the date by year-month-day */}
                {review?.createdAt != null
                  ? format(new Date(review?.createdAt), "yyyy-MM-dd")
                  : "Unknown Date"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              alignSelf: "stretch",
            }}
          >
            {review?.recommended ? (
              <StyledThumbUpIcon />
            ) : (
              <StyledThumbDownIcon />
            )}
            <Box
              sx={{
                borderRadius: "32px",
                display: "flex",
                width: "52px",
                height: "52px",
                alignItems: "center",
              }}
              bgcolor={`${getReviewColor(review?.score)}.main`}
            >
              <Typography
                variant="h6"
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
        <Box
          sx={{
            display: "flex",
            height: "162px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "12px",
            alignSelf: "stretch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: "1 0 0",
              alignSelf: "stretch",
            }}
          >
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 5,
                textOverflow: "ellipsis",
                fontWeight: 500,
                overflow: "hidden",
                wordBreak: "break-all",
                maxHeight: "144px",
              }}
            >
              {review?.comment}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                flex: "1 0 0",
                overflow: "hidden",
                whiteSpace: "nowrap",
                wordBreak: "break-all",
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {review?.playTime != null && review?.playTime > 1
                  ? `${playTimeString(review.playTime)} Played`
                  : "Unknown Playtime"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              size="medium"
              LinkComponent={Link}
              href={`/review/${review?.id}`}
            >
              Read More
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider flexItem />
      <Box
        sx={{
          display: "flex",
          padding: "2px 12px",
          justifyContent: "space-between",
          alignItems: "center",
          flex: "1 0 0",
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
          <Typography variant="subtitle2" color="text.secondary">
            {`AI Sentiment: ${
              review.sentiment != null
                ? review.sentiment == 1
                  ? "Positive"
                  : "Negative"
                : "Coming soon..."
            }`}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <StyledThumbUpIcon sx={{ fontSize: 18 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {review?.numberOfLikes ?? 0}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <StyledThumbDownIcon sx={{ fontSize: 18 }} />
            <Typography variant="subtitle2" color="text.secondary">
              {review?.numberOfDislikes ?? 0}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <StyledImageIcon />
            <Typography variant="subtitle2" color="text.secondary">
              {review?.reviewImages?.length ?? 0}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <StyledCommentIcon />
            <Typography variant="subtitle2" color="text.secondary">
              {review?.numberOfComments ?? 0}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default GameReviewCardSmall;

