import { Box, ButtonBase, Card, CardContent, CardMedia, CircularProgress, Typography, circularProgressClasses, styled } from "@mui/material";
import { GameInfo } from "../type/game";
import Image from "next/image";
import { getScoreColor } from "@/utils/DynamicScore";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import Link from "next/link";
import { format } from "date-fns";

type GameDLCCardProps = {
  game: GameInfo;
};

const StyledBrokenImageIcon = styled(BrokenImageIcon)(({ theme }) => ({
  fontSize: 96,
  color: theme.palette.error.main,
}));

function GameDLCCardSmall({ game }: GameDLCCardProps) {
  return (
    <ButtonBase 
      LinkComponent={Link}
      href={`/games/${game.id}`}
      sx={{ 
        display: 'flex', 
        flexDirection: "column",
        bgcolor: "background.default", 
        borderRadius: "12px 8px 32px 12px", 
        width: "100%", 
        overflow: "hidden",
        boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.25)",
        margin: "auto"
      }}
    >
      {game.iconUrl ? (
        <CardMedia
          component="img"
          sx={{ width: "100%", height: 164 }}
          image={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${game.iconUrl}`}
          alt={`${game.name} icon`}
        />
      ) : (
        <Box
          sx={{
            minWidth: 164,
            minHeight: 164,
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <StyledBrokenImageIcon />
          <Typography variant="h6" color="error.main">
            No Icon
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: "12px", width: "100%", height: "100%" }}>
        <Typography 
          variant="h6" 
          color="text.primary" 
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            textOverflow: "ellipsis",
            fontWeight: 700,
            overflow: "hidden",
            height: "100%",
          }}
        >
          {game.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box
            sx={{
              alignSelf: "flex-end",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {game.developerCompany}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(game?.releaseDate), "yyyy-MM-dd")}
            </Typography>
          </Box>
          <Box
            sx={{
              position: "relative",
              alignSelf: "flex-end",
              height: 56,
              width: 56,
            }}
          >
            <CircularProgress
              variant="determinate"
              size={56}
              thickness={4}
              value={100}
              sx={(theme) => ({
                color: theme.palette.divider,
                opacity: 0.2,
              })}
            />
            <CircularProgress
              variant="determinate"
              size={56}
              thickness={4}
              value={game?.score ?? 0}
              color={getScoreColor(game?.percentile)}
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
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                }}
                color={game.score ? `${getScoreColor(game.percentile)}.main` : "divider"}
              >
                {game.score ? Math.round(game.score).toString() : "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </ButtonBase>
  );
}

export default GameDLCCardSmall;

