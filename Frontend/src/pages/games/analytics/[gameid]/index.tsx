import { GameAnalytic } from "@/type/game";
import { Box, Breadcrumbs, Button, Divider, Typography, styled, useMediaQuery, useTheme, alpha, CircularProgress, circularProgressClasses, ButtonBase } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ChecklistIcon from "@mui/icons-material/Checklist";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Grid from '@mui/material/Unstable_Grid2';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { getScoreColor } from "@/utils/DynamicScore";

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

type StatisticBoxProps = {
  IconComponent: React.ElementType;
  number: string;
  description: string;
  color: string;
  colorCode: string;
};

interface Datum {
  id: string;
  label: string;
  value: number;
}

interface BarDatum {
  [key: string]: string | number;
}

const StatisticBox = ({ IconComponent, number, description, color, colorCode }: StatisticBoxProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "18px",
    }}
  >
    <Box
      sx={{
        display: "flex",
        padding: "18px",
        alignItems: "center",
        borderRadius: "50%",
        background: alpha(colorCode, 0.16),
      }}
    >
      <IconComponent />
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: "4px"
      }}
    >
      <Typography variant="h5" color={color} sx={{ fontWeight: 500 }}>
        {number}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Box>
);

const StyledFavoriteBorderOutlinedIcon = styled(FavoriteBorderOutlinedIcon)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: 36,
}));

const StyledChecklistIcon = styled(ChecklistIcon)(({ theme }) => ({
  color: theme.palette.info.main,
  fontSize: 36,
}));

const StyledRateReviewOutlinedIcon = styled(RateReviewOutlinedIcon)(({ theme }) => ({
  color: theme.palette.warning.main,
  fontSize: 36,
}));

function GameAnalyticsPage({ gameAnalytics, errorMessage }: GameAnalyticsPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const nivoTheme = {
    "text": {
      "fontSize": 14,
      "fill": theme.palette.text.primary,
    },
    "axis": {
      "legend": {
          "text": {
              "fontSize": 16,
              "fill": theme.palette.text.primary,
          },
      },
      "ticks": {
        "text": {
            "fontSize": 12,
            "fill": theme.palette.text.secondary,
        }
      },
    }, 
    "labels":{
      "text": {
        "fontSize": 14,
      }
    },
    "legends": {
      "title": {
          "text": {
              "fontSize": 16,
              "fill": theme.palette.text.primary,
          }
      },
      "text": {
          "fontSize": 14,
          "fill": theme.palette.text.secondary,

      },
  },
  }

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
          [theme.breakpoints.down("md")]: {
            padding: "24px 16px",
          },
          [theme.breakpoints.down("sm")]: {
            padding: "24px 8px",
          },
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

  const reviewsRecommendationData: Datum[] = [
    {
      id: "Recommended",
      label: "Recommended",
      value: gameAnalytics.recommendedReviews["RECOMMEND"],
    },
    {
      id: "Not Recommended",
      label: "Not Recommended",
      value: gameAnalytics.recommendedReviews["DO NOT RECOMMEND"],
    },
  ];

  const reviewLengthData: BarDatum[] = [
    { reviewLength: "0-100", count: gameAnalytics.reviewLength["0-100"] ?? 0},
    { reviewLength: "100-200", count: gameAnalytics.reviewLength["100-200"] ?? 0},
    { reviewLength: "200-300", count: gameAnalytics.reviewLength["200-300"] ?? 0},
    { reviewLength: "300-400", count: gameAnalytics.reviewLength["300-400"] ?? 0},
    { reviewLength: "400-500", count: gameAnalytics.reviewLength["400-500"] ?? 0},
    { reviewLength: "500-600", count: gameAnalytics.reviewLength["500-600"] ?? 0},
    { reviewLength: "600-700", count: gameAnalytics.reviewLength["600-700"] ?? 0},
    { reviewLength: "700-800", count: gameAnalytics.reviewLength["700-800"] ?? 0},
    { reviewLength: "800-900", count: gameAnalytics.reviewLength["800-900"] ?? 0},
    { reviewLength: "900-1000", count: gameAnalytics.reviewLength["900-1000"] ?? 0},
    { reviewLength: "1000+", count: gameAnalytics.reviewLength["1000+"] ?? 0},
  ];
        
  return (
    <div>
      <Head>
        <title>{`Analytics | ${gameAnalytics.name} | CritiQ`}</title>
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
          [theme.breakpoints.down("md")]: {
            padding: "16px 16px",
            gap: "24px",
          },
          [theme.breakpoints.down("sm")]: {
            padding: "16px 12px",
            gap: "16px",
          },
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
              [theme.breakpoints.down("md")]: {
                padding: "32px 16px",
              },
              [theme.breakpoints.down("sm")]: {
                padding: "24px 12px",
              },
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              gap: "24px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid container spacing={2} columns={{xs: 2, sm: 4, md: 12}}>
              <Grid xs={2} md={4}>
                <StatisticBox
                  IconComponent={StyledFavoriteBorderOutlinedIcon}
                  number={gameAnalytics.numberOfFavourites?.toString() ?? "Unknown"}
                  description="Favorites"
                  color="secondary"
                  colorCode={theme.palette.secondary.main}
                />
              </Grid>       
              <Grid xs={2} md={4}>
                <StatisticBox
                  IconComponent={StyledChecklistIcon}
                  number={gameAnalytics.numberOfWishlists?.toString() ?? "Unknown"}
                  description="Wishlists"
                  color="info.main"
                  colorCode={theme.palette.info.main}
                />
              </Grid>
              <Grid xs={2} md={4}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ButtonBase
                    LinkComponent={Link}
                    href={`/games/${router.query.gameid}/reviews`}
                    sx={{
                      borderRadius: "8px",
                    }}
                  >
                    <StatisticBox
                      IconComponent={StyledRateReviewOutlinedIcon}
                      number={gameAnalytics.numberOfReviews?.toString() ?? "Unknown"}
                      description="Reviews"
                      color="warning.main"
                      colorCode={theme.palette.warning.main}
                    />
                  </ButtonBase>
                </Box>  
              </Grid>     
            </Grid>
            <Grid container spacing={4} columns={{xs: 2, md: 4, lg: 12}}>
              <Grid xs={2} lg={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: "300px",
                    }}
                    color="text.primary"
                  >
                    Recommendation Ratio
                  </Typography>
                  <Box
                    sx={{
                      height: "325px",
                      width: "300px",
                    }}
                  >
                    {(gameAnalytics?.numberOfReviews && gameAnalytics?.numberOfReviews) > 0 ? (
                      <ResponsivePie
                        theme={nivoTheme}
                        data={reviewsRecommendationData}
                        innerRadius={0.65}
                        margin={{ top: 12, right: 0, bottom: 36, left: 0 }}
                        padAngle={1.8}
                        cornerRadius={6}
                        activeOuterRadiusOffset={8}
                        colors={{ scheme: 'accent' }}
                        borderWidth={1}
                        borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                        enableArcLinkLabels={false}
                        arcLabelsSkipAngle={10}
                        legends={[
                          {
                              anchor: 'bottom',
                              direction: 'row',
                              justify: false,
                              translateX: 0,
                              translateY: 36,
                              itemsSpacing: 0,
                              itemWidth: 150,
                              itemHeight: 18,
                              itemTextColor: theme.palette.text.primary,
                              itemDirection: 'left-to-right',
                              itemOpacity: 1,
                              symbolSize: 18,
                              symbolShape: 'circle',
      
                          }
                        ]}
                      />) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "300px",
                          height: "300px",
                          borderRadius: "50%",
                          bgcolor: "divider",
                          boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                          opacity: 0.48,
                          marginTop: "12px",
                        }}
                      >
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                          No Review Data
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>       
              <Grid xs={2} lg={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: "300px",
                    }}
                    color="text.primary"
                  >
                    Game Score
                  </Typography>
                  <Box
                    sx={{
                      height: "325px",
                      position: "relative",
                      display: "inline-flex", 
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      size={290}
                      thickness={6}
                      value={100}
                      sx={(theme) => ({
                        color: theme.palette.divider,
                        opacity: 0.4,
                      })}
                    />
                    <CircularProgress
                      variant="determinate"
                      size={290}
                      thickness={6}
                      value={gameAnalytics?.score ?? 0}
                      color={getScoreColor(gameAnalytics?.percentile)}
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
                        variant="h1"
                        component="div"
                        sx={{
                          fontWeight: 700,
                          textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                        }}
                        color={
                          gameAnalytics.score
                            ? `${getScoreColor(gameAnalytics.percentile)}.main`
                            : "divider"
                        }
                      >
                        {gameAnalytics.score ? Math.round(gameAnalytics.score).toString() : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid xs={2} lg={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      maxWidth: "300px",
                    }}
                    color="text.primary"
                  >
                    Percentile Ranking
                  </Typography>
                  <Box
                    sx={{
                      height: "325px",
                      position: "relative",
                      display: "inline-flex", 
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      size={290}
                      thickness={6}
                      value={100}
                      sx={(theme) => ({
                        color: theme.palette.divider,
                        opacity: 0.4,
                      })}
                    />
                    <CircularProgress
                      variant="determinate"
                      size={290}
                      thickness={6}
                      value={gameAnalytics?.percentile}
                      color={getScoreColor(gameAnalytics?.percentile)}
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
                        variant="h2"
                        component="div"
                        sx={{
                          fontWeight: 700,
                          textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                        }}
                        color={
                          gameAnalytics.score
                            ? `${getScoreColor(gameAnalytics.percentile)}.main`
                            : "divider"
                        }
                      >
                        {gameAnalytics.percentile ? `${Math.round(gameAnalytics.percentile).toString()}%` : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>     
            </Grid>
          </Box>
        </Box>
        
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <Divider textAlign="center" flexItem>
            <Typography variant={isTablet? "h6" : "h5"} color="primary" fontWeight={700}>
              Reviews
            </Typography>
          </Divider>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "12px",
              bgcolor: "background.paper",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Typography
              variant={isTablet? "subtitle1" : "h6"}
              color="text.primary"
              sx={{
                textAlign: "center",
                fontWeight: 500,
                marginTop: "12px",
              }} 
            >
              Distribution of Review Lengths
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: "425px",
                [theme.breakpoints.down("md")]: {
                  height: "350px",
                },
                [theme.breakpoints.down("sm")]: {
                  height: "300px",
                },
              }}
            >
              <ResponsiveBar
                  theme={nivoTheme}
                  data={reviewLengthData}
                  keys={['count']}
                  indexBy="reviewLength"
                  margin={{ top: 12, right: 0, bottom: 68, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ scheme: 'accent' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 8,
                    tickPadding: 4,
                    legend: 'Review Length',
                    legendPosition: 'middle',
                    legendOffset: 48,
                    tickRotation: isTablet ? -25 : 0
                  }}
                  axisLeft={{
                    tickSize: 8,
                    tickPadding: 4,
                    tickRotation: 0,
                    legend: 'Count',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  animate={true}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default GameAnalyticsPage;

