import { getGenre } from "../type/gameGenre";
import { GameInfo } from "../type/game";
import { Box, Typography, ButtonBase } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

type SearchGameCardProps = {
  gameData: GameInfo;
};

function SearchGameCard({ gameData }: SearchGameCardProps) {
  const router = useRouter();

  const handleNewGamePageRedirect = () => {
    router.push(`/games/${gameData.id}`);
  };

  return (
    <ButtonBase
      onClick={handleNewGamePageRedirect}
      sx={{ borderRadius: "12px 4px" }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          height: "160px",
          padding: "8px 0px 8px 32px",
          alignItems: "center",
          gap: "24px",
          alignSelf: "stretch",
          borderRadius: "12px 4px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          width: "100%",
        })}
      >
        <Box
          sx={{
            display: "flex",
            width: "144px",
            height: "144px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "12px 100px 100px 100px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "white",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {gameData.iconUrl ? (
            <Image
              width={144}
              height={144}
              src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${gameData.iconUrl}`}
              alt={`${gameData.name} Icon`}
              style={{ objectFit: "cover" }}
            ></Image>
          ) : (
            <>
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "text.secondary" }}
              >
                No Image
              </Typography>
              <BrokenImageIcon sx={{ color: "text.secondary" }} />
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            padding: "12px",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "12px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              alignSelf: "stretch",
            }}
          >
            <Typography variant="h4" gutterBottom={false}>
              {gameData?.name}{" "}
              {gameData?.dlc === true && gameData?.baseGame !== null
                ? `[${gameData?.baseGame.name} DLC]`
                : ""}
            </Typography>
            <Typography
              variant="subtitle1"
              gutterBottom={false}
              color="text.secondary"
            >
              {gameData?.developerCompany}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-end",
              alignSelf: "stretch",
            }}
          >
            {gameData?.inDevelopment && (
              <Box
                sx={{
                  display: "flex",
                  padding: "4px 16px",
                  alignItems: "center",
                  borderRadius: "100px",
                  border: "1px solid",
                  borderColor: "secondary.main",
                }}
              >
                <Typography
                  variant="subtitle1"
                  gutterBottom={false}
                  color="secondary.main"
                >
                  Early Access
                </Typography>
              </Box>
            )}
            {gameData?.genre.map(
              (genre, index) =>
                index < 3 && (
                  <Box
                    sx={{
                      display: "flex",
                      padding: "4px 16px",
                      alignItems: "center",
                      borderRadius: "100px",
                      border: "1px solid",
                      borderColor: "info.main",
                    }}
                    key={genre}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom={false}
                      color="info.main"
                    >
                      {getGenre(genre)}
                    </Typography>
                  </Box>
                )
            )}

            {gameData?.genre.length > 3 && (
              <Typography
                variant="subtitle1"
                gutterBottom={false}
                color="info.main"
              >
                and more
              </Typography>
            )}
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom={false}
              color="text.secondary"
            >{`${
              gameData?.platforms.length > 1
                ? `${gameData?.platforms[0]} ...more`
                : gameData?.platforms[0]
            } | ${gameData.releaseDate}`}</Typography>
          </Box>
        </Box>

        <Box
          sx={(theme) => ({
            display: "flex",
            width: "180px",
            height: "220px",
            transform: "rotate(12deg)",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,

            position: "relative",
            right: "-13px",

            borderRadius: "32px",
            background:
              gameData.score > 70
                ? theme.palette.success.main
                : gameData.score > 50
                ? theme.palette.warning.main
                : theme.palette.error.main,
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          })}
        >
          <Typography
            variant="h2"
            gutterBottom={false}
            color="background.default"
            sx={{
              transform: "rotate(-12deg)",
              fontWeight: 700,
              textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          >
            {Math.round(gameData.score).toString()}
          </Typography>
        </Box>
      </Box>
    </ButtonBase>
  );
}

export default SearchGameCard;

