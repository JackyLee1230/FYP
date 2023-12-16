import React from "react";
import { GetServerSideProps } from "next";
import "tailwindcss/tailwind.css";
import axios from "axios";
import { GameInfo, GamePageProps } from "@/type/game";
import Platform, { getPlatform } from "@/type/gamePlatform";
import Genre, { getGenre } from "@/type/gameGenre";
import Head from "next/head";
import { useRouter } from "next/router";
import { formatTime } from "@/utils/StringUtils";
import Link from "next/link";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import _ from "lodash";
import { Box, Button, Typography, styled, Tooltip, CircularProgress, circularProgressClasses, ButtonBase } from "@mui/material";
import Image from "next/image";
import { alpha } from "@mui/material";
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { EarlyAccessDefinition, DLCDefinition } from "@/utils/Definition";
import { getScoreColor } from "@/utils/DynamicScore";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  const { gameid } = context.query;

  let game = null;
  let reviews = null;
  let errorMessage = null;
  let iconUrl = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/findGameById`,
      { id: gameid },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
    // const reviewsResponse = await axios.post(
    //   `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewsByGameId`,
    //   { gameId: gameid },
    //   {
    //     headers: {
    //       "Access-Control-Allow-Origin": "*",
    //       "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    //       "Access-Control-Allow-Headers": "Content-Type, Authorization",
    //       "Access-Control-Allow-Credentials": "true",
    //     },
    //   }
    // );

    if (response.status === 200) {
      game = await response.data;
      if (game.iconUrl) {
        iconUrl = `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${game.iconUrl}`;
      }
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    // console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      game,
      errorMessage,
      iconUrl,
    },
  };
};

const StyledBrokenImageIcon = styled(BrokenImageIcon)(({ theme }) => ({
  fontSize: 300,
  color: theme.palette.error.main,
}));

function GamePage({ game, errorMessage, iconUrl }: GamePageProps) {
  const router = useRouter();

  if (errorMessage) {
    return <div className="text-center text-xl font-bold">{errorMessage}</div>;
  }

  if (!game) {
    return <div className="text-center text-xl font-bold">Game not found</div>;
  }

  console.log(game);

  return (
    <div>
      <Head>
        <title>{game.name}</title>
      </Head>
      <Box
        sx={(theme) => ({
          position: "absolute",
          left: "-18.105px",
          top: "-48.711px",
          width: "110%",
          height: "250px",
          transform: "rotate(-2deg)",
          background: theme.palette.secondary.main,
          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          zIndex: -1,
        })}
      />

      <Box
        sx={{
          display: "flex",
          padding: "24px 86px",
          maxWidth: 1440,
          flexDirection: "column",
          flex: "1 0 0",
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "stretch",
            borderRadius: "48px 48px 168px 24px",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            background: alpha("#FFFFFF", 0.5),
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "516px",
              width: "100%",
              display: "flex",
              position: "relative", 
            }}
          >
            {iconUrl ? (
              <Image
                loading={"lazy"}
                src={iconUrl}
                alt="Game Icon"
                fill
                style={{objectFit: "cover"}}
              />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  flexDirection: "column",
                }}
              >
                <StyledBrokenImageIcon />
                <Typography variant="h3" color="error">
                  This game has no icon
                </Typography>
              </Box>
            )}
              <Box
                sx={{
                  position: "absolute",
                  display: "flex",
                  padding: "24px 42px",
                  width: "100%",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right: "42px",
                  }}
                >
                  <Button variant="contained" color="primary" >
                      more
                  </Button>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    right: "42px",
                    bottom: "24px",
                  }}
                >
                  {game.genre && game.genre.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        alignSelf: "stretch",
                        gap: "16px",
                      }}
                    >
                        {game.genre.map((genre, index) => (
                          (index < 3 &&
                            <Box
                              key={genre}
                              sx={(theme) => ({
                                borderRadius: "8px",
                                border: "1px solid",
                                borderColor: theme.palette.background.default,
                                background: theme.palette.info.main,
                                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                                display: "flex",
                                padding: "4px 16px",
                                justifyContent: "center",
                                alignItems: "center",
                              })}
                            >
                              <Typography
                                variant="h6"
                                color="background.default"
                              >
                                {getGenre(genre)}
                              </Typography>
                            </Box>
                          )
                        ))}
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    left: "42px",
                    bottom: "24px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                  }}
                >
                  {game.inDevelopment && (
                    <Tooltip title={EarlyAccessDefinition}> 
                      <Box
                        sx={(theme) => ({
                          borderRadius: "64px",
                          background: theme.palette.secondary.main,
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset",
                          display: "flex",
                          padding: "12px 32px",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "12px",
                          flexDirection: "row",
                        })}
                      >
                        <Typography
                          variant="h4"
                          color="background.default"
                        >
                          Early Access
                        </Typography>
                        <HelpOutlineIcon 
                          sx={{
                            fontSize: "24px",
                            color: "background.default",
                          }}
                        />
                      </Box>
                    </Tooltip>
                  )}
                  {game.dlc && game.baseGame && (
                    <Tooltip title={DLCDefinition(game?.baseGame?.name)}>
                      <ButtonBase
                        LinkComponent={Link} 
                        href={`/games/${game?.baseGame?.id}`}
                        sx={{
                          borderRadius: "32px",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={(theme) => ({
                            background: theme.palette.info.main,
                            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25) inset",
                            display: "flex",
                            padding: "4px 16px",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                            flexDirection: "row",
                            height: "fit-content"
                          })}
                        >
                          <Typography
                            variant="h5"
                            color="background.default"
                          >
                            DLC
                          </Typography>
                          <ArrowCircleRightOutlinedIcon 
                            sx={{
                              fontSize: "16px",
                              color: "background.default",
                            }}
                          />
                        </Box>
                      </ButtonBase>
                    </Tooltip>
                  )}
                </Box>
              </Box>
          </Box>

          <Box
            sx={(theme) => ({
              display: "flex",
              width: "100%",
              padding: "24px 32px",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              background: theme.palette.background.paper,
            })}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                alignSelf: "stretch",
              }}
            >
              <Typography 
                variant="h4" 
                color="text.primary"
                sx={{
                  fontWeight: 700,
                  textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                  textAlign: "center",
                }}
              >
                {game.name}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "flex-start",
                gap: "16px",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexShrink: 0,
                  alignSelf: "stretch",
                  flex: 1,
                  wordBreak: "break-word",
                }}
              >
                <Typography 
                  variant="subtitle1"
                  color="text.primary"
                  sx={{
                    display: "-webkit-box",
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3,
                    textOverflow: 'ellipsis',
                    fontWeight: 500,
                    overflow: "hidden",
                  }}
                >
                  {`${game.description ?? "No Description"}`}
                </Typography>
                <Typography 
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                  <b>Platform(s): </b>{game?.platforms && game?.platforms.length > 0 ? game?.platforms.map((platform) => getPlatform(platform)).join(", ") : "Unknown"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                    <b>Version: </b>{`${game?.version ?? "Unknown" }`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                    <b>Released On: </b>{`${game?.releaseDate ?? "Unknown"}`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                    <b>Developed By: </b>{`${game?.developerCompany ?? "Unknown"}`}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{
                    fontWeight: 500,
                  }}
                >
                    <b>Published By: </b>{`${game?.publisher ?? "Unknown"}`}
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  position: 'relative', 
                  display: 'inline-flex'
                }}
              >
                <CircularProgress
                  variant="determinate"
                  size={264}
                  thickness={3}
                  value={100}
                  sx={(theme) => ({
                    color: theme.palette.divider,
                    opacity: 0.2,
                  })}
                />
                <CircularProgress
                  variant="determinate"
                  size={264}
                  thickness={3}
                  value={game?.score ?? 0}
                  disableShrink
                  color={getScoreColor(game?.percentile)}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h1"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                    }}
                    color={`${getScoreColor(game?.percentile)}.main`}
                  >
                    {`${Math.round(game?.score)}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <h1 className="text-4xl font-bold mb-4">{game.name}</h1>
      <p className="text-lg mb-4">{game.description}</p>
      {game.dlc && game.dlc === true && (
        <p>
          <PriorityHighIcon />
          This DLC/Expandsion requires the base game{" "}
          <Link href={`/games/${game?.baseGame?.id}`}>
            {game?.baseGame?.name}
          </Link>{" "}
          to play!
        </p>
      )}

      {!!game.percentile && (
        <p>
          This game ranks in the top {_.round(game.percentile, 1)}% of all games
          on CritiQ!
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="font-bold">Release Date:</span>
          {game.releaseDate ? (
            <span>{game.releaseDate}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Developer Company:</span>
          {game.developerCompany ? (
            <span>{game.developerCompany}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Publisher:</span>
          {game.publisher ? (
            <span>{game.publisher}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Score:</span>
          {game.score ? (
            <span>{game.score}</span>
          ) : (
            <span className="text-gray-500">No Review Yet</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Recommendation Score:</span>
          {game.recommendationScore ? (
            <span>{game.recommendationScore}</span>
          ) : (
            <span className="text-gray-500">No Review Yet</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Genre:</span>
          {game.genre && game.genre.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.genre.map((genre) => (
                <li key={genre}>{getGenre(genre)}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Versions:</span>
          {game.versions && game.versions.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.versions.map((version) => (
                <li key={version.version}>{version.version}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Version:</span>
          {game.version ? (
            <span>{game.version}</span>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">Platforms:</span>
          {game.platforms && game.platforms.length > 0 ? (
            <ul className="list-disc list-inside">
              {game.platforms.map((platform) => (
                <li key={platform}>{getPlatform(platform)}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold">In Development:</span>

          {typeof game.inDevelopment === "boolean" ? (
            game.inDevelopment ? (
              <span>Yes</span>
            ) : (
              <span>No</span>
            )
          ) : (
            <span className="text-gray-500">Unknown</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="flex flex-col">
          {game.gameReviews && game.gameReviews.length > 1
            ? `Reviews [${game.gameReviews.length}]`
            : "Review [1]"}
          :
        </div>

        {game.gameReviews && game.gameReviews.length > 0 ? (
          <div className="list-disc list-inside">
            {game.gameReviews.map((review) => (
              <div
                onClick={() => {
                  router.push(`/review/${review.id}`);
                }}
                key={review.id}
                className="bg-gray-500 rounded-md cursor-pointer"
              >
                <div className="m-4">
                  <div>
                    Review By {review.reviewer?.name} on{" "}
                    {formatTime(review.createdAt)}:
                    <br />
                    Score: {review.score}
                    <br />
                    <p>AI Sentiment: {review.sentiment}</p>
                  </div>
                  <br />
                  {review.comment}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">No Review Yet</span>
        )}
      </div>
    </div>
  );
}

export default GamePage;

