import { GameAnalytic } from "@/type/game";
import { Box, Breadcrumbs, Button, Divider, Typography, useMediaQuery, useTheme } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Grid from '@mui/material/Unstable_Grid2';

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { gameid } = context.query;

  let gameAnalytics = null;
  let errorMessage = null;

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/game/gameAnalytic`,
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

    if (response.status === 200) {
      gameAnalytics = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
  }

  return {
    props: {
      gameAnalytics,
      errorMessage,
    },
  };
};

type GameAnalyticsPageProps = {
    gameAnalytics: GameAnalytic | null;
    errorMessage: string;
};

function GameAnalyticsPage({ gameAnalytics, errorMessage }: GameAnalyticsPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  if (!gameAnalytics || errorMessage) {
    return (
      <Box
        sx={{
          display: "flex",
          padding: "24px 32px",
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          gap: "32px",
          overflowX: "hidden",
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Game Analytics Not Found
        </Typography>
      </Box>
    );
  }

  const breadcrumbs = [
    <Button
      key="1"
      color="inherit"
      href={`/games/${router.query.gameid}`}
      sx={{
        textDecoration: "none",
        textTransform: "none",
        "&:hover": { textDecoration: "underline" },
        justifyContent: "flex-start",
        color: "white",
      }}
      LinkComponent={Link}
      variant="text"
    >
      <Typography variant={isTablet ? "h6" : "h5"} color="background.default" sx={{ fontWeight: 700 }}>
        {gameAnalytics?.name}
      </Typography>
    </Button>,
    <Box
      key="2"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        overflow: "hidden",
        whiteSpace: "nowrap",
        wordBreak: "break-all",
        color: "white",
        [theme.breakpoints.down("md")]: { gap: "2px" },
      }}
    >
      <Typography variant={isTablet ? "subtitle2" : "subtitle1"} color="background.default">
        Analytics Dashboard
      </Typography>
    </Box>,
  ];
        
  return (
    <div>
      <Head>
        <title>{`${gameAnalytics.name} Game Analytics | CritiQ`}</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          padding: "24px 32px",
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          justifyContent: "center",
          alignContent: "center",
          flexDirection: "column",
          gap: "32px",
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            height: "350px",
            borderRadius: "36px 12px",
            background: `url(${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${gameAnalytics.iconUrl}) lightgray 50% / cover no-repeat`,
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              padding: "48px 32px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              background: `linear-gradient(0deg, rgba(28, 40, 38, 0.96) 0%, rgba(38, 70, 83, 0.12) 100%)`,
              width: "100%",
            }}
          >
            <Breadcrumbs 
              separator={<NavigateNextIcon fontSize="small" sx={{color: "white"}} />}
              sx={{
                "& .MuiBreadcrumbs-ol": {
                  justifyContent: "center",
                }
              }}
            >
              {breadcrumbs}
            </Breadcrumbs>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: "12px",
            bgcolor: "background.paper",
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              padding: "24px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant={isTablet? "h6" : "h5"} color="primary.main" sx={{ fontWeight: 700 }}>
              Game Statistics
            </Typography>
          </Box>
          <Divider flexItem />
          <Grid container spacing={2} sx={{ padding: "24px" }}>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}

export default GameAnalyticsPage;

