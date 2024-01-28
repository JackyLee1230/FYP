import { Skeleton } from "@mui/material";

function GameReviewCardSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      sx={{
        borderRadius: "12px",
        height: 300,
      }}
    />
  );
}

export default GameReviewCardSkeleton;

