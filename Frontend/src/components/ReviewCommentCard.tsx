import { Avatar, Box, Typography } from "@mui/material";
import { GameReviewComment } from "../type/game";
import { format } from "date-fns";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

const NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX =
  process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX;

type ReviewCommentCardProps = {
  ReviewComment: GameReviewComment;
};

function ReviewCommentCard({ReviewComment}: ReviewCommentCardProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "24px",
        alignSelf: "stretch",
      }}
    >
      <Avatar
        alt="Reviewer Avatar Icon"
        src={
          ReviewComment?.commenter?.iconUrl != null
            ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${ReviewComment?.commenter?.iconUrl}`
            : "/static/images/avatar/1.jpg"
        }
        sx={{ width: 72, height: 72, alignSelf: "flex-start"}}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          width: "100%"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Typography variant="h6" color="text.primary" sx={{fontWeight: 700}}>
            {ReviewComment?.commenter?.name ?? "Unknown User"}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{textTransform: "uppercase",}}>
              {ReviewComment?.createdAt != null
                ? format(new Date(ReviewComment?.createdAt), "yyyy-MM-dd HH:mm aaaaa'm'")
                : "Unknown Date"}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "inline-block",
            width: "100%",
            minHeight: "42px",
          }}
        >
          <Typography variant="body2" color="text.primary" sx={{whiteSpace: "pre-wrap"}}>
            {ReviewComment?.comment}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default ReviewCommentCard;