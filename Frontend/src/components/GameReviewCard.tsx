import { GameReview } from "../type/game";
import { getPlatform } from "@/type/gamePlatform";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  styled,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import { getReviewColor } from "@/utils/DynamicScore";
import { format } from "date-fns";
import { playTimeString } from "@/utils/Other";

type GameReviewCardProps = {
  review: GameReview;
};

const StyledThumbUpIcon = styled(ThumbUpIcon)(({ theme }) => ({
  color: theme.palette.success.main,
  fontSize: 32,
}));

const StyledThumbDownIcon = styled(ThumbDownIcon)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: 32,
}));

const StyledCommentIcon = styled(CommentIcon)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 24,
}));

function GameReviewCard({ review }: GameReviewCardProps) {
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
        height: 300,
      }}
    >
      <Box
        sx={{
          display: "flex",
          padding: "12px",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "12px",
          alignSelf: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: "64px",
            justifyContent: "space-between",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              alignSelf: "stretch",
            }}
          >
            <Avatar
              alt="Reviewer Avatar Icon"
              src={
                review?.reviewer?.iconUrl != null
                  ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${review?.reviewer?.iconUrl}`
                  : "/static/images/avatar/1.jpg"
              }
              sx={{ width: 54, height: 54 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {review?.reviewer?.name ?? "Unknown User"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              alignSelf: "stretch",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {/* format the date by year-month-day */}
              {review?.createdAt != null
                ? format(new Date(review?.createdAt), "yyyy-MM-dd")
                : "Unknown Date"}
            </Typography>
            {review?.recommended ? (
              <StyledThumbUpIcon />
            ) : (
              <StyledThumbDownIcon />
            )}
            <Box
              sx={{
                borderRadius: "32px",
                display: "flex",
                width: "64px",
                height: "64px",
                alignItems: "center",
              }}
              bgcolor={`${getReviewColor(review?.score)}.main`}
            >
              <Typography
                variant="h5"
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
            height: "142px",
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
                WebkitLineClamp: 4,
                textOverflow: "ellipsis",
                fontWeight: 500,
                overflow: "hidden",
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
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {review?.playTime != null
                  ? playTimeString(review.playTime)
                  : "Unknown Playtime,"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {review?.platform != null
                  ? `Platform: ${getPlatform(review?.platform)},`
                  : "Platform: Unknown,"}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {review?.gameVersion != null
                  ? `Version: ${review?.gameVersion}`
                  : "Version: Unknown"}
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
          <Typography variant="subtitle1" color="text.secondary">
            AI Sentiment: coming soon.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <StyledCommentIcon />
          <Typography variant="subtitle1" color="text.secondary">
            {review?.reviewComments?.length ?? 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default GameReviewCard;
