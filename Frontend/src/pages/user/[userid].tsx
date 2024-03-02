import UpdateUserIcon from "@/components/UpdateUserIcon";
import UpdateUsernameBox from "@/components/UpdateUsername";
import UpdateUserBannerBox from "@/components/UpdateUserBanner";
import { useAuthContext } from "@/context/AuthContext";
import { UserPageProps } from "@/type/user";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import { Avatar, Box, Button, ButtonBase, Fade, FormControl, FormControlLabel, Grid, InputLabel, LinearProgress, ListItemIcon, Menu, MenuItem, Modal, Pagination, Select, TextField, Tooltip, Typography, styled, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { alpha } from "@mui/material";
import { CustomPrivateSwitch } from "@/components/CustomPrivateSwitch";
import { format } from "date-fns";
import Edit from "@mui/icons-material/Edit";
import GameReviewCard from "@/components/GameReviewCard";
import GameReviewCardSmall from "@/components/GameReviewCardSmall";
import GameReviewCardSkeleton from "@/components/GameReviewCardSkeleton";
import { GameReview } from "@/type/game";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userid } = context.query;

  let user = null;
  let errorMessage = null;

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/findUserById`,
      { id: userid },
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
      user = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    // console.error(error);
    errorMessage = error.toString();
  }

  return {
    props: {
      user,
    },
  };
};

const sendVerifyEmail = async (email: string, token: string) => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/sendVerifyEmail`,
      { email: email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    console.error(error);
  }
};

const togglePrivate = async (id: number, token: string) => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/togglePrivate`,
      { id: id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any) {
    console.error(error);
  }
};

const getUserReviews = async(
  reviewerId: number,
  reviewsPerPage: number,
  pageNum: number,
  reviewSortType: "latest" | "oldest" | "highestScore"
) => {
  let sortBy;
  let order
  if(reviewSortType === "latest") {
    sortBy = "recency";
    order = "desc";
  } else if(reviewSortType === "oldest") {
    sortBy = "recency";
    order = "asc";
  } else {
    sortBy = "score";
    order = "desc";
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findReviewsByReviewerIdPaged`,
      { reviewerId: reviewerId, reviewsPerPage: reviewsPerPage, pageNum: pageNum, sortBy: sortBy, order: order },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
    if (response.status === 200) {
      const result = await response.data;
      return result;
    }
    else{
      return null;
    }
  } catch (error: any){
    console.error(error);
    return null;
  }
}

const StyledEditIcon = styled(EditIcon)(({ theme }) => ({
  color: "#ffffff",
  fontSize: 24,
}));

const StyledPersonIcon = styled(PersonIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: 32,
}));

const StyledMailIcon = styled(MailIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: 24,
}));

const StyledSettingsIcon = styled(SettingsIcon)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: 24,
}));

const StyledMoreIcon = styled(MoreHorizOutlinedIcon)(({ theme }) => ({
  color: "#ffffff",
  fontSize: 36,
}));

const StyledCheckIcon = styled(CheckIcon)(({ theme }) => ({
  color: "#ffffff",
  fontSize: 18,
}));

const StyledPriorityHighIcon = styled(PriorityHighIcon)(({ theme }) => ({
  color: "#ffffff",
  fontSize: 18,
}));

export default function User({ user }: UserPageProps) {
  const router = useRouter();
  const auth = useAuthContext();
  const isCurrentUser = auth.user && user?.id === auth.user.id
  const [updateIconOpen, setUpdateIconOpen] = useState<boolean>(false);
  const [updateUsernameOpen, setUpdateUsernameOpen] = useState<boolean>(false);
  const [updateBannerOpen, setUpdateBannerOpen] = useState<boolean>(false);
  const [emailWaitingTime, setEmailWaitingTime] = useState<number>(60);
  const [isWaitingEmail, setIsWaitingEmail] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(user?.isPrivate ?? false);
  const [isPrivateLoading, setIsPrivateLoading] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  const theme = useTheme();
  const [reviewsPerPage, setReviewsPerPage] = useState<number>(5);
  const [pageNum, setPageNum] = useState<number>(1);
  const [reviews, setReviews] = useState<null | GameReview[]>(null);
  const [isReviewLoading, setIsReviewLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [reviewSortType, setReviewSortType] = useState<"latest" | "oldest" | "highestScore">("latest");
  const [reachEnd, setReachEnd] = useState<boolean>(false);
  const observerTarget = useRef(null);
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    scrollToTop();
    setPageNum(value);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWaitingEmail) {
      interval = setInterval(() => {
        setEmailWaitingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      clearInterval(interval as unknown as NodeJS.Timeout);
    }
    if (emailWaitingTime < 0) {
      setIsWaitingEmail(false);
    }
    return () => clearInterval(interval as NodeJS.Timeout);
  }, [emailWaitingTime, isWaitingEmail]);

  function startTimer() {
    setIsWaitingEmail(!isWaitingEmail);
    setEmailWaitingTime(60);
  }

  const handleReviewFetch = useCallback(
    async () => {
      if (user?.id) {
        if(user.numOfReviews > reviewsPerPage) {
          setIsReviewLoading(true);
        }
        const newReviews = await getUserReviews(user?.id, reviewsPerPage, pageNum-1, reviewSortType);
        if(newReviews["content"].length + reviews?.length >= user?.numOfReviews) {
          setReachEnd(true);
        }
        setReviews(prevReviews => [...(prevReviews ?? []), ...newReviews["content"]]);
        setIsReviewLoading(false);
        setIsInitialLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageNum, reviewsPerPage, user?.id, reviewSortType]
  );

  useEffect(() => {
    handleReviewFetch();
  }, [handleReviewFetch]);

  useEffect(() => {
    if(!reachEnd && !isInitialLoading && !isReviewLoading) {
      let observerRefValue: Element | null = null;

      const observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            setPageNum(prevPageNum => prevPageNum + 1);
          }
        },
        { threshold: 1 }
      );
    
      if (observerTarget.current) {
        observer.observe(observerTarget.current);
        observerRefValue = observerTarget.current;
      }
    
      return () => {
        if (observerRefValue) {
          observer.unobserve(observerRefValue);
        }
      };
    }
  }, [isInitialLoading, isReviewLoading, observerTarget, reachEnd]);

  if (user == null) {
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
          gap: 4,
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          User Not Found
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{user.name ? `${user.name}'s Profile Page` : "Invalid User"} | CritiQ</title>
      </Head>

      <Box
        sx={{
          width: "1440px",
          maxWidth: "100%",
          overflow: "hidden",
          height: "325px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          margin: "0 auto",

          [theme.breakpoints.down("md")]: {
            height: "350px",
          },
        }}
      >
        <Box
          sx={(theme) => ({
            position: "absolute",
            left: "-5px",
            top: "-25.001px",
            width: "110%",
            maxWidth: "1450px",
            height: "315px",
            transform: "rotate(-1deg)",
            background: theme.palette.secondary.main,
            boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            zIndex: -1,
            overflow: "hidden",
            backgroundImage: `url(${user?.bannerUrl ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.bannerUrl}` : user?.iconUrl ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.iconUrl}` : "/banner.png"})`,
            backgroundSize: "cover",

            [theme.breakpoints.down("md")]: {
              height: "340px",
            },
          })}
        />
      </Box>

      <Box
        sx={{
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          padding: "86px 86px 48px 86px",
          alignItems: "flex-start",
          gap: "32px",

          [theme.breakpoints.down("lg")]: {
            padding: "86px 18px 48px 18px",
            gap: "12px",
          },
          [theme.breakpoints.down("md")]: {
            padding: "24px 18px 24px 18px",
            flexDirection: "column",
          },
          [theme.breakpoints.down("sm")]: {
            padding: "24px 12px 24px 12px",
            flexDirection: "column",
          },
        }}
      >
        {isTablet && (
          <Fade in={isCurrentUser ?? false}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                position: "absolute",
                right: 12,
                top: 68,
                zIndex: 2,

                [theme.breakpoints.down("sm")]: {
                  top: 62,
                },
              }}
            >
              <CustomPrivateSwitch 
                checked={isPrivate}
                disabled={isPrivateLoading}
                sx={{ m: 1 }}  
                onClick={() => {
                  setIsPrivateLoading(true);
                  togglePrivate(user.id, auth.token!)
                    .then(() => {
                      setIsPrivate(!isPrivate);
                      if(isPrivate) {
                        displaySnackbarVariant("Your profile is now public", "success");
                      }
                      else {
                        displaySnackbarVariant("Your profile is now private", "success");
                      }
                    })
                    .catch((error) => {
                      displaySnackbarVariant("Failed to Toggle Private", "error");
                    })
                    .finally(() => {
                      setIsPrivateLoading(false);
                    });
                }}
              />
              <ButtonBase
                sx={{
                  display: "flex",
                  padding: "2px",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "background.paper",
                  bgcolor: "info.main",
                  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                }}
                onClick={handleMenuOpen}
              >
                <StyledMoreIcon />
              </ButtonBase>
              <Menu
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    bgcolor: "white",
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    marginTop: "8px",
                    minWidth: 225,
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "white",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                    "& .MuiMenuItem-root": {
                      minHeight: "42px"
                    }
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem 
                  onClick={() => {
                    setUpdateUsernameOpen(true);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Edit fontSize="medium" />
                  </ListItemIcon>
                  <Typography variant="body1" color="text.primary">
                    Update username
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setUpdateBannerOpen(true);
                    handleMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <Edit fontSize="medium" />
                  </ListItemIcon>
                  <Typography variant="body1" color="text.primary">
                    Update profile banner
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Fade>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            position: "sticky",
            top: "24px",

            [theme.breakpoints.down("md")]: {
              position: "static",
              alignSelf: "center",
              gap: "12px",
              width: "100%"
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignitems: "flex-end",
              gap: "24px",
              position: "relative",
            }}
          >
            {isCurrentUser && (
              <Fade in={isCurrentUser}>
                <ButtonBase
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    borderRadius: "50%",
                    border: "2px solid",
                    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                    borderColor: "background.paper",
                    bgcolor: "secondary.main",
                    padding: "16px",
                    zIndex: 2,

                    [theme.breakpoints.down("md")]: {
                      padding: "8px",
                    },
                  }}
                  onClick={() => {
                    setUpdateIconOpen(true);
                  }}
                >
                  <StyledEditIcon />
                </ButtonBase>
              </Fade>
            )}
            <Avatar
              alt="User Avatar Icon"
              src={
                user?.iconUrl != null
                  ? `${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user?.iconUrl}`
                  : "/static/images/avatar/1.jpg"
              }
              sx={{ 
                width: 264, 
                height: 264,
                border: "6px solid",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                borderColor: "background.paper",

                [theme.breakpoints.down("md")]: {
                  width: 212, 
                  height: 212,
                },
              }}
            />
          </Box>

          {isTablet && (
            <Box
              sx={{
                display: "flex",
                padding: "12px 0px 6px 0px",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                gap: "8px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Typography variant="h4" color="text.primary" sx={{fontWeight: 700}}>
                  {user.name ?? "Unknown User"}
                </Typography>

                <Tooltip title={user.isVerified ? "Verified User" : "Unverified User"}>
                  <Box
                    sx={{
                      display: "flex",
                      alignSelf: "flex-end",
                      marginBottom: "8px",
                      padding: "2px",
                      borderRadius: "50%",
                      bgcolor: user.isVerified ? "#4FA639" : "error.main",

                      [theme.breakpoints.down("md")]: {
                        padding: "0px",
                      },
                    }}
                  >
                    {user.isVerified ? <StyledCheckIcon /> : <StyledPriorityHighIcon />}
                  </Box>
                </Tooltip>
              </Box>

              <Typography variant="subtitle1" color="text.secondary" sx={{visibility: isCurrentUser ? "visible" : isPrivate ? "hidden" : "visible" }}>
                {`Last active: ${isCurrentUser ? auth?.user?.lastActive ? 
                  format(new Date(auth?.user?.lastActive), "yyyy-MM-dd") : "Unknown" : 
                  isPrivate ? 
                  "Undisclosed" : 
                  user?.lastActive ? format(new Date(user?.lastActive), "yyyy-MM-dd") : "Unknown"}`}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              width: "368px",
              padding: "24px",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              gap: "24px",
              borderRadius: "8px 32px 8px 8px",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.50)",
              [theme.breakpoints.down("md")]: {
                padding: "16px",
                gap: "16px",
              },
              [theme.breakpoints.down("sm")]: {
                width: "100%",
                padding: "12px",
                gap: "12px",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                paddingBottom: "12px",
                justifyContent: "center",
                alignItems: "center",
                gap:  "4px",
                alignSelf: "stretch",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <StyledPersonIcon />
              <Typography variant={isTablet ? "h6" : "h5"} color="text.primary" sx={{fontWeight: 700}}>
                Personal Information
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end" ,
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: '8px',
                }}
              >
                <StyledMailIcon/>
                <Typography variant={isTablet ? "subtitle1" : "h6"} color="text.primary" sx={{fontWeight: 500}}>
                  Email Address:
                </Typography>
              </Box>
              <Typography variant={isTablet ? "body2" : "subtitle1"} color="text.secondary">
                {isCurrentUser ? auth?.user?.email ?? "Not provided" : isPrivate ? "Undisclosed" : user?.email ?? "Not provided"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end" ,
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: '8px',
                }}
              >
                <Typography variant={isTablet ? "subtitle1" : "h6"} color="text.primary" sx={{fontWeight: 500}}>
                  Gender:
                </Typography>
              </Box>
              <Typography variant={isTablet ? "body2" : "subtitle1"} color="text.secondary">
                {isCurrentUser ? auth?.user?.gender ?? "Not provided" : isPrivate ? "Undisclosed" : user?.gender ?? "Not provided"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end" ,
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: '8px',
                }}
              >
                <Typography variant={isTablet ? "subtitle1" : "h6"} color="text.primary" sx={{fontWeight: 500}}>
                  Age:
                </Typography>
              </Box>
              <Typography variant={isTablet ? "body2" : "subtitle1"} color="text.secondary">
                {isCurrentUser ? auth?.user?.age ?? "Not provided" : isPrivate ? "Undisclosed" : user?.age ?? "Not provided"}
              </Typography>
            </Box>
          </Box>

          {isCurrentUser && (
            <Fade in={isCurrentUser}>
              <Box
                sx={{
                  display: "flex",
                  width: "368px",
                  padding: "24px",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  gap: "24px",
                  borderRadius: "8px 32px 8px 8px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: "0px 2px 2px 0px rgba(0, 0, 0, 0.50)",
                  [theme.breakpoints.down("sm")]: {
                    width: "100%",
                    padding: "12px",
                    gap: "12px",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    paddingBottom: "12px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap:  "4px",
                    alignSelf: "stretch",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <StyledSettingsIcon />
                  <Typography variant={isTablet ? "h6" : "h5"} color="text.primary" sx={{fontWeight: 700}}>
                    Settings
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end" ,
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Typography variant={isTablet ? "subtitle1" : "h6"} color="text.primary">
                      {`Account Status:`}
                    </Typography>
                    <Typography variant={isTablet ? "subtitle1" : "h6"} color={user.isVerified ? "#4FA639" : "error"}>
                      {user.isVerified ? "Verified" : "Unverified"} 
                    </Typography>
                  </Box>

                  {user.isVerified === null || user.isVerified === false && (
                    <Button 
                      variant="contained" 
                      color="info" 
                      onClick={() => {
                        sendVerifyEmail(user.email, auth.token!)
                          .then(() => {
                            startTimer();
                            displaySnackbarVariant(
                              "Verification Email Sent",
                              "success"
                            );
                          })
                          .catch((error) => {
                            displaySnackbarVariant(
                              "Failed to Send Verification Email",
                              "error"
                            );
                          });
                      }}
                      disabled={isWaitingEmail}
                    >
                      {`${isWaitingEmail ? `Verification Email Sent (${emailWaitingTime})` : "Request Verification Email"}`}
                    </Button>
                  )}
                </Box>
              </Box>
            </Fade>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "32px",
            width: "100%",
          }}
        >
          {!isTablet && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "56px",
                width: "100%",
              }}
            >
              <Fade in={isCurrentUser ?? false}>
                <Box
                  sx={(theme) => ({
                    display: "flex",
                    padding: "22px 12px",
                    alignItems: "center",
                    gap: "24px",
                    borderRadius: "24px 48px 12px 48px",
                    bgcolor: alpha(theme.palette.background.paper, 0.58),
                    boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                  })}
                >
                  <FormControlLabel
                    control={
                      <CustomPrivateSwitch 
                        checked={isPrivate}
                        disabled={isPrivateLoading}
                        sx={{ m: 1 }}  
                        onClick={() => {
                          setIsPrivateLoading(true);
                          togglePrivate(user.id, auth.token!)
                            .then(() => {
                              setIsPrivate(!isPrivate);
                              if(isPrivate) {
                                displaySnackbarVariant("Your profile is now public", "success");
                              }
                              else {
                                displaySnackbarVariant("Your profile is now private", "success");
                              }
                            })
                            .catch((error) => {
                              displaySnackbarVariant("Failed to Toggle Private", "error");
                            })
                            .finally(() => {
                              setIsPrivateLoading(false);
                            });
                        }}
                      />
                    }
                    label={isPrivate ? "Profile Hidden" : "Profile Shown"}
                  />

                  <ButtonBase
                    sx={{
                      display: "flex",
                      padding: "4px",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      alignItems: "flex-start",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: "background.paper",
                      bgcolor: "info.main",
                      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                    }}
                    onClick={handleMenuOpen}
                  >
                    <StyledMoreIcon />
                  </ButtonBase>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        bgcolor: "white",
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                        marginTop: "8px",
                        minWidth: 225,
                        "&:before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "white",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                        "& .MuiMenuItem-root": {
                          minHeight: "42px"
                        }
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem 
                      onClick={() => {
                        setUpdateUsernameOpen(true);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <Edit fontSize="medium" />
                      </ListItemIcon>
                      <Typography variant="body1" color="text.primary">
                        Update username
                      </Typography>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setUpdateBannerOpen(true);
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <Edit fontSize="medium" />
                      </ListItemIcon>
                      <Typography variant="body1" color="text.primary">
                        Update profile banner
                      </Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              </Fade>

              <Box
                sx={{
                  display: "flex",
                  padding: "12px 0px 6px 0px",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  alignSelf: "flex-start",
                  gap: "8px",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Typography variant="h3" color="text.primary" sx={{fontWeight: 700}}>
                    {user.name ?? "Unknown User"}
                  </Typography>

                  <Tooltip title={user.isVerified ? "Verified User" : "Unverified User"}>
                    <Box
                      sx={{
                        display: "flex",
                        alignSelf: "flex-end",
                        marginBottom: "8px",
                        padding: "2px",
                        borderRadius: "50%",
                        bgcolor: user.isVerified ? "#4FA639" : "error.main",
                      }}
                    >
                      {user.isVerified ? <StyledCheckIcon /> : <StyledPriorityHighIcon />}
                    </Box>
                  </Tooltip>
                </Box>

                <Typography variant="h6" color="text.secondary" sx={{visibility: isCurrentUser ? "visible" : isPrivate ? "hidden" : "visible" }}>
                  {`Last active: ${isCurrentUser ? auth?.user?.lastActive ? 
                    format(new Date(auth?.user?.lastActive), "yyyy-MM-dd") : "Unknown" : 
                    isPrivate ? 
                    "Undisclosed" : 
                    user?.lastActive ? format(new Date(user?.lastActive), "yyyy-MM-dd") : "Unknown"}`}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              padding: "12px",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-start",
              gap: "24px",
              borderRadius: "8px 8px 32px 8px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              width: "100%",

              [theme.breakpoints.down("md")]: {
                gap: "12px",
              },
            }}
          >
            {isPrivate && !isCurrentUser ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  gap: "12px",
                }}
              >
                <Typography variant="h5" color="text.primary" fontWeight={600}>
                  {`This user's profile is private`}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {`You don't have the permission to view this user's review history.`}
                </Typography>
              </Box>
            ) : (
              user?.numOfReviews > 0 ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      padding: "4px 12px",
                    }}
                  >
                    <Typography variant={isTablet ? "h6" : "h5"} color="text.primary" fontWeight={600}>
                      {`${user.name}'s Review${user.numOfReviews > 1 ? `s (${user.numOfReviews})` : ` (${user.numOfReviews})`}`}
                    </Typography>

                    <FormControl 
                      sx={{ 
                        minWidth: 150,
                        [theme.breakpoints.down("sm")]: {
                          minWidth: 100,
                        },
                      }}
                    >
                      <Select
                        color="primary"
                        value={reviewSortType}
                        onChange={(event) => {
                          setReviewSortType(event.target.value as "latest" | "oldest" | "highestScore");
                          setIsInitialLoading(true);
                          setPageNum(1);
                          setReviews(null);
                          setReachEnd(false);
                        }}
                        autoWidth={false}
                        disabled={isInitialLoading || isReviewLoading}
                      >
                        <MenuItem value="latest">Latest</MenuItem>
                        <MenuItem value="oldest">Oldest</MenuItem>
                        <MenuItem value="highestScore">Highest Score</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Grid 
                    container 
                    spacing={{xs: 1, md: 2, lg: 3}} 
                  >
                    {isInitialLoading ? (
                      [...Array(Math.min(reviewsPerPage, user?.numOfReviews - (pageNum-1)*5))].map((_, index) => (
                        <Grid item key={index} xs={12}>
                          <GameReviewCardSkeleton />
                        </Grid>
                      ))
                    ) : (
                      reviews?.map((review) => (
                        <Grid item key={review.id} xs={12}>
                          {isMobile ? <GameReviewCardSmall review={review} mode="game"/> : <GameReviewCard review={review} mode="game"/>}
                        </Grid>
                      ))
                    )}
                  </Grid>
                  {/*
                  <Box sx={{ width: "100%" }}>
                    <Pagination
                      color="primary"
                      variant="outlined"
                      size={"large"}
                      count={Math.ceil(user?.numOfReviews / reviewsPerPage)}
                      page={pageNum}
                      onChange={handlePageChange}
                      sx={{
                        "& .MuiPagination-ul": {
                          alignItems: "center",
                          justifyContent: "center",
                        },  
                      }}
                    />
                  </Box>
                  */}
                  {!reachEnd &&
                    <Box ref={observerTarget} sx={{visibility: "hidden"}}></Box>
                  }
                  {isReviewLoading && (
                    <Box sx={{ width: '95%', alignSelf:"center"}}>
                      <LinearProgress color="primary" />
                    </Box>
                  )}

                  {reachEnd && (
                    <Box sx={{ width: '100%', display: "flex", justifyContent: "center" }}>
                      <Typography variant="overline" color="divider">No more reviews to show</Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    gap: "12px",
                  }}
                >
                  <Typography variant="h5" color="text.primary" fontWeight={600}>
                    {`This user has not written any reviews`}
                  </Typography>
                </Box>
              )
            )}
          </Box>
        </Box>
      </Box>

      <Modal
        open={updateIconOpen}
        onClose={() => {
          setUpdateIconOpen(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UpdateUserIcon setUpdateIconOpen={setUpdateIconOpen}/>
      </Modal>

      <Modal
        open={updateUsernameOpen}
        onClose={() => {
          setUpdateUsernameOpen(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UpdateUsernameBox setUpdateUsernameOpen={setUpdateUsernameOpen} oldName={user?.name} userId={auth?.user?.id} token={auth?.token} />
      </Modal>

      <Modal
        open={updateBannerOpen}
        onClose={() => {
          setUpdateBannerOpen(false);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UpdateUserBannerBox setUpdateBannerOpen={setUpdateBannerOpen}/>
      </Modal>
    </>
  );
}

