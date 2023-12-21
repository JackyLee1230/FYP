import { GameReview } from "../type/game";
import { getPlatform } from "@/type/gamePlatform";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  styled,
  Button,
  Skeleton,
} from "@mui/material";
import { useRouter } from "next/router";
import Link from "next/link";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import { getReviewColor } from "@/utils/DynamicScore";
import { format } from "date-fns";
import { playTimeString } from "@/utils/Other";

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

