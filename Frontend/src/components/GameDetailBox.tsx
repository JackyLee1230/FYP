import { getGenre } from "@/type/gameGenre";
import { getPlatform } from "@/type/gamePlatform";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, IconButton, Typography } from "@mui/material";
import { format } from "date-fns";
import _ from "lodash";
import { GameInfo } from "../type/game";

type GameDetailBoxProps = {
  game: GameInfo;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function GameDetailBox({ game, setOpen }: GameDetailBoxProps) {
  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "white",
        borderRadius: 4,
        padding: "36px 48px",
        border: "0.8px solid",
        borderColor: "divider",
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        gap: 2,
        width: "610px",
        overflow: "auto",
        maxHeight: "75vh",
      }}
    >
      <IconButton
        size="large"
        color="info"
        onClick={() => setOpen(false)}
        sx={{
          position: "absolute",
          top: 24,
          right: 36,
        }}
      >
        <CloseRoundedIcon />
      </IconButton>

      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", textAlign: "center" }}
        color="info.main"
      >
        {`${game?.name}`}
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ alignSelf: "flex-start" }}
      >
        {game?.description}
      </Typography>
      {game?.inDevelopment && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The game is still in the development process and is available for early access. However, the game is not final and could change a lot before it is released. The quality and content of the game might not satisfy you at this point. The game might receive more or less updates or revisions from the developers later on.`}
        </Typography>
      )}
      {game?.genre?.length > 0 && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The genre${game?.genre.length > 1 ? "s" : ""} of this game ${
            game?.genre.length > 1 ? "are" : "is"
          } ${game?.genre
            .map((genre, index) =>
              index === game?.genre.length - 1 && game?.genre.length > 1
                ? `and ${getGenre(genre)}`
                : getGenre(genre)
            )
            .join(", ")}.`}
        </Typography>
      )}
      {game?.platforms?.length > 0 && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The platform${game?.platforms.length > 1 ? "s" : ""} of this game ${
            game?.platforms.length > 1 ? "are" : "is"
          } ${game?.platforms
            .map((platform, index) =>
              index === game?.platforms.length - 1 && game?.platforms.length > 1
                ? `and ${getPlatform(platform)}`
                : getPlatform(platform)
            )
            .join(", ")}.`}
        </Typography>
      )}
      {game?.version && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The version of this game is ${game?.version}.`}
        </Typography>
      )}
      {game?.releaseDate && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`This game is released on ${format(
            new Date(game?.releaseDate),
            "yyyy-MM-dd"
          )}.`}
        </Typography>
      )}
      {game?.developerCompany && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The developer of this game is ${game?.developerCompany}.`}
        </Typography>
      )}
      {game?.publisher && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ alignSelf: "flex-start" }}
        >
          {`The publisher of this game is ${game?.publisher}.`}
        </Typography>
      )}
      <Typography
        variant="subtitle1"
        color="text.secondary"
        sx={{ alignSelf: "flex-start" }}
      >
        {`This game ranks in the top ${_.round(
          100 - game?.percentile,
          1
        )}% of all games on CritiQ.`}
      </Typography>
    </Box>
  );
}

export default GameDetailBox;

