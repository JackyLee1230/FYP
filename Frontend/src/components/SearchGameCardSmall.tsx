import { getPlatform } from "@/type/gamePlatform";
import { getScoreColor } from "@/utils/DynamicScore";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import {
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Typography,
  circularProgressClasses,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import Link from "next/link";
import { GameInfo } from "../type/game";
import { getGenre } from "../type/gameGenre";

type SearchGameCardSmallProps = {
  gameData: GameInfo;
};

function SearchGameCardSmall({ gameData }: SearchGameCardSmallProps) {
  const theme = useTheme();
  const primayColor = theme.palette.primary.main;

  return (
    <ButtonBase
      LinkComponent={Link}
      href={`/games/${gameData.id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: "12px",
        border: `0.5px solid ${primayColor}`,
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        background: gameData.iconUrl
          ? `url(${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${gameData.iconUrl}), lightgray 50% / cover no-repeat`
          : undefined,
        backgroundPosition: "center center",
        backgroundSize: gameData.iconUrl ? "cover" : undefined,
        minHeight: "266px",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            padding: "12px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            alignSelf: "stretch",
          }}
        >
          {gameData?.inDevelopment && (
            <Chip
              size="medium"
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
              size={64}
              thickness={6.5}
              value={100}
              sx={(theme) => ({
                color: theme.palette.divider,
                opacity: 0.2,
              })}
            />
            <CircularProgress
              variant="determinate"
              size={64}
              thickness={6.5}
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
                variant="h5"
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
          }}
        >
          {gameData.genre.slice(0, 3).map((genre, index) => (
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
          padding: "12px",
          flexDirection: "column",
          alignRtems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
          background: `linear-gradient(0deg, ${primayColor} 0%, rgba(28, 40, 38, 0.74) 50.11%, rgba(28, 40, 38, 0.53) 73.17%, rgba(28, 40, 38, 0.29) 90.88%, rgba(28, 40, 38, 0.00) 100%)`,
        }}
      >
        <Typography variant="h6" color="white" sx={{ fontWeight: 700 }}>
          {gameData?.name}
        </Typography>
        {gameData?.developerCompany && (
          <Typography variant="subtitle1" color="lightgrey">
            {gameData?.developerCompany}
          </Typography>
        )}
        <Typography variant="subtitle1" color="lightgrey">
          {`
          ${
            gameData?.platforms && gameData?.platforms.length > 0
              ? gameData?.platforms.length > 1
                ? `${getPlatform(gameData?.platforms[0])} ...more | `
                : `${getPlatform(gameData?.platforms[0])} | `
              : "Unknown Platform |"
          }
          ${format(new Date(gameData?.releaseDate), "yyyy-MM-dd")}
          ${
            gameData?.dlc === true && gameData?.baseGame !== null
              ? `| ${gameData?.baseGame.name} DLC`
              : ""
          }
          ${
            gameData?.numberOfReviews && gameData?.numberOfReviews > 0
              ? gameData?.numberOfReviews > 1
                ? `| ${gameData?.numberOfReviews} Reviews`
                : "| 1 Review"
              : "| No Reviews"
          }
          `}
        </Typography>
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

export default SearchGameCardSmall;

