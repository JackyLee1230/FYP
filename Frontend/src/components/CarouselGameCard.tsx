import { getScoreColor } from "@/utils/DynamicScore";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import {
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Typography,
  alpha,
  circularProgressClasses,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { GameInfo } from "../type/game";
import { getGenre } from "../type/gameGenre";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import RateReviewIcon from "@mui/icons-material/RateReview";

type CarouselGameCardProps = {
  gameData: GameInfo;
};

const StyledFavoriteBorderOutlinedIcon = styled(FavoriteBorderOutlinedIcon)(
  ({ theme }) => ({
    color: theme.palette.secondary.main,
    fontSize: 24,
    [theme.breakpoints.down("md")]: {
      fontSize: 20,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 16,
    },
  })
);

const StyledChecklistIcon = styled(ChecklistIcon)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: 24,
  [theme.breakpoints.down("md")]: {
    fontSize: 20,
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 16,
  },
}));

const StyledRateReviewIcon = styled(RateReviewIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: 24,
  [theme.breakpoints.down("md")]: {
    fontSize: 20,
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 16,
  },
}));

function CarouselGameCard({ gameData }: CarouselGameCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const primayColor = theme.palette.primary.main;

  return (
    <ButtonBase
      LinkComponent={Link}
      href={`/games/${gameData.id}`}
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        width: "234px",
        height: "375px",
        borderRadius: "8px",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        background: gameData.iconUrl
          ? `url(${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${gameData.iconUrl}), lightgray 50% / cover no-repeat`
          : undefined,
        backgroundPosition: "center center",
        backgroundSize: gameData.iconUrl ? "cover" : undefined,
        [theme.breakpoints.down("md")]: {
          width: "200px",
          height: "345px",
        },
        [theme.breakpoints.down("sm")]: {
          width: "165px",
          height: "285px",
        },
      })}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
          height: "100%",
        }}
      >
        <Box
          sx={(theme) => ({
            display: "flex",
            padding: "12px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            alignSelf: "stretch",
            [theme.breakpoints.down("md")]: {
              padding: "8px",
            },
            [theme.breakpoints.down("sm")]: {
              padding: "4px",
            },
          })}
        >
          {gameData?.inDevelopment && (
            <Chip
              size={isMobile ? "small" : "medium"}
              color="secondary"
              variant="filled"
              label="Early Access"
            />
          )}
          <Box id="gapHolderz" />
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              alignSelf: "flex-end",
              borderRadius: "50%",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <CircularProgress
              variant="determinate"
              size={isMobile ? 48 : 64}
              thickness={isMobile ? 5.5 : 6.5}
              value={100}
              sx={(theme) => ({
                color: theme.palette.divider,
                opacity: 0.2,
              })}
            />
            <CircularProgress
              variant="determinate"
              size={isMobile ? 48 : 64}
              thickness={isMobile ? 5.5 : 6.5}
              value={gameData?.score ?? 0}
              color={getScoreColor(gameData?.percentile)}
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
                variant={isMobile ? "h6" : "h5"}
                component="div"
                sx={{
                  fontWeight: 700,
                  textShadow:
                    "2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff;",
                }}
                color={
                  gameData.score
                    ? `${getScoreColor(gameData.percentile)}.main`
                    : "divider"
                }
              >
                {gameData.score ? Math.round(gameData.score).toString() : "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {gameData?.genre && gameData?.genre?.length > 0 && (
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            flexDirection: "row",
            alignItems: "flex-end",
            alignSelf: "flex-end",
            width: "100%",
            gap: "4px",
            justifyContent: "flex-end",
            [theme.breakpoints.down("md")]: {
              padding: "8px",
            },
            [theme.breakpoints.down("sm")]: {
              padding: "4px",
            },
          }}
        >
          {gameData.genre.slice(0, 1).map((genre, index) => (
            <Chip
              key={index}
              size="small"
              color="info"
              variant="filled"
              label={getGenre(genre)}
            />
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          padding: "8px",
          flexDirection: "column",
          alignItems: "flex-start",
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          width: "100%",
        }}
      >
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          color="text.primary"
          fontWeight={700}
          sx={{
            maxWidth: "100%",
          }}
          noWrap
        >
          {gameData?.name}
        </Typography>
        <Typography
          variant={isMobile ? "subtitle2" : "subtitle1"}
          color="text.secondary"
          sx={(theme) => ({
            maxWidth: "100%",
          })}
          noWrap
        >
          {gameData?.developerCompany}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            width: "100%",
            [theme.breakpoints.down("md")]: {
              gap: "4px",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              padding: "4px 8px",
              gap: "8px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "24px",
              background: alpha(theme.palette.primary.main, 0.16),
              [theme.breakpoints.down("sm")]: {
                padding: "2px 4px",
                gap: "4px",
              },
            }}
          >
            <StyledRateReviewIcon />
            <Typography
              variant={isMobile ? "subtitle2" : "subtitle1"}
              color="primary"
            >
              {gameData?.numberOfReviews}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              [theme.breakpoints.down("md")]: {
                gap: "4px",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                padding: "4px 8px",
                gap: "8px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "24px",
                background: alpha(theme.palette.secondary.main, 0.16),
                [theme.breakpoints.down("sm")]: {
                  padding: "2px 4px",
                  gap: "4px",
                },
              }}
            >
              <StyledFavoriteBorderOutlinedIcon />
              <Typography
                variant={isMobile ? "subtitle2" : "subtitle1"}
                color="secondary"
              >
                {gameData?.numberOfFavourites}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                padding: "4px 8px",
                gap: "8px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "24px",
                background: alpha(theme.palette.info.main, 0.16),
                [theme.breakpoints.down("sm")]: {
                  padding: "2px 4px",
                  gap: "4px",
                },
              }}
            >
              <StyledChecklistIcon />
              <Typography
                variant={isMobile ? "subtitle2" : "subtitle1"}
                color="info.main"
              >
                {gameData?.numberOfWishlists}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {!gameData?.iconUrl && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "12px",
            flexDirection: "column",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            zIndex: -1,
            bgcolor: "background.paper",
          }}
        >
          <BrokenImageIcon color="error" sx={{ fontSize: 64 }} />
          <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
            No Game Icon
          </Typography>
        </Box>
      )}
    </ButtonBase>
  );
}

export default CarouselGameCard;

