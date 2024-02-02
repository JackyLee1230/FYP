import RoleChip from "@/components/RoleChip";
import UpdateUserIcon from "@/components/UpdateUserIcon";
import { useAuthContext } from "@/context/AuthContext";
import { UserPageProps } from "@/type/user";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import { Avatar, Box, Button, ButtonBase, Fade, FormControlLabel, Modal, TextField, Typography, styled, useTheme } from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { alpha } from "@mui/material";
import { CustomPrivateSwitch } from "@/components/CustomPrivateSwitch";
import { format } from "date-fns";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userid } = context.query;

  let user = null;
  let reviews = null;
  let errorMessage = null;
  let iconUrl = null;

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

const submitChangeUsername = async (
  id: number,
  username: string,
  token: string
) => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/user/updateUsername`,
      { id: id, name: username },
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
) => {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/review/findAllReviewsByUserPaged`,
      { reviewerId: reviewerId, reviewsPerPage: reviewsPerPage, pageNum: pageNum },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error: any){
    console.error(error);
    return null;
  }
}

const StyledEditIcon = styled(EditIcon)(({ theme }) => ({
  color: "#FFFFFF",
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
  color: "#FFFFFF",
  fontSize: 36,
}));

export default function User({ user }: UserPageProps) {
  const router = useRouter();
  const auth = useAuthContext();
  const isCurrentUser = auth.user && user?.id === auth.user.id

  console.log(auth.user);
  console.log(user);

  const [updateIconOpen, setUpdateIconOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [emailWaitingTime, setEmailWaitingTime] = useState<number>(60);
  const [isWaitingEmail, setIsWaitingEmail] = useState<boolean>(false);

  const [isPrivate, setIsPrivate] = useState<boolean>(user?.isPrivate ?? false);
  const [isPrivateLoading, setIsPrivateLoading] = useState<boolean>(false);

  const theme = useTheme();

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
          maxWidth: "100vw",
          overflow: "hidden",
          height: "325px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          margin: "0 auto",
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
          })}
        />
      </Box>

      <Box
        sx={{
          maxWidth: 1440,
          flex: "1 0 0",
          margin: "0 auto",
          display: "flex",
          padding: "86px 86px 48px 86px",
          alignItems: "flex-start",
          gap: "32px",
          overflow: "hidden",

          [theme.breakpoints.down("lg")]: {
            padding: "86px 32px 48px 32px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
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
              alt="Reviewer Avatar Icon"
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
              }}
            />
          </Box>

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
              <Typography variant="h5" color="text.primary" sx={{fontWeight: 700}}>
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
                <Typography variant="h6" color="text.primary" sx={{fontWeight: 500}}>
                  Email Address:
                </Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
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
                <Typography variant="h6" color="text.primary" sx={{fontWeight: 500}}>
                  Gender:
                </Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
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
                <Typography variant="h6" color="text.primary" sx={{fontWeight: 500}}>
                  Age:
                </Typography>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
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
                  <Typography variant="h5" color="text.primary" sx={{fontWeight: 700}}>
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
                    <Typography variant="h6" color="text.primary">
                      {`Account Status:`}
                    </Typography>
                    <Typography variant="h6" color={user.isVerified ? "text.secondary" : "error"}>
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
                      {`Request Verification Email${isWaitingEmail ? ` (${emailWaitingTime})` : ""}`}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
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
                >
                  <StyledMoreIcon />
                </ButtonBase>
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
                  visibility: user.isVerified ? "hidden" : "visible",
                  padding: "3px 12px",
                  flexDirection: "column",
                  alignSelf: "flex-start",
                  borderRadius: "68px",
                  border: "2px solid",
                  borderColor: "error.main",
                  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                  bgcolor: "background.default"
                }}
              >
                <Typography 
                  variant="h6" 
                  color="error.main" 
                  sx={{            
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    wordBreak: "break-all",
                  }}
                >
                  Unverified account
                </Typography>
              </Box>

              <Typography variant="h3" color="text.primary" sx={{fontWeight: 700}}>
                {user.name ?? "Unknown User"}
              </Typography>

              <Typography variant="h6" color="text.secondary" sx={{visibility: isCurrentUser ? "visible" : isPrivate ? "hidden" : "visible" }}>
                {`Last active: ${isCurrentUser ? auth?.user?.lastActive ? 
                  format(new Date(auth?.user?.lastActive), "yyyy-MM-dd") : "Unknown" : 
                  isPrivate ? 
                  "Undisclosed" : 
                  user?.lastActive ? format(new Date(user?.lastActive), "yyyy-MM-dd") : "Unknown"}`}
              </Typography>
            </Box>
          </Box>

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
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h5" color="text.primary" fontWeight={600}>
                {`${user.name}'s Review${user.numOfReviews > 1 ? `s (${user.numOfReviews})` : ` (${user.numOfReviews})`}`}
              </Typography>
            </Box>
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
        <UpdateUserIcon setUpdateIconOpen={setUpdateIconOpen} />
      </Modal>
      {/*
      {user.iconUrl ? (
        <img
          className="w-24 h-24 rounded-full mx-auto"
          src={`${process.env.NEXT_PUBLIC_GAMES_STORAGE_PATH_PREFIX}${user.iconUrl}`}
          alt="User icon"
        />
      ) : (
        <div className="w-24 h-24 rounded-full mx-auto bg-gray-200" />
      )}
      {auth.user && user.id === auth.user.id && (
        <>
          {" "}
          <Button
            variant="contained"
            onClick={() => {
              setUpdateIconOpen(true);
            }}
          >
            UPDATE USER ICON
          </Button>
          <Modal
            open={updateIconOpen}
            onClose={() => {
              setUpdateIconOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
            }}
          >
            <UpdateUserIcon setUpdateIconOpen={setUpdateIconOpen} />
          </Modal>
        </>
      )}
      <br />
      <br />
      <br />
      <RoleChip role={user.role} direction="row" includeUser={true} />
      <br />
      {auth.user && user.id === auth.user.id && (
        <>
          Change Your Username:
          <TextField
            variant="outlined"
            onChange={(e) => {
              setNewUsername(e.target.value);
            }}
          ></TextField>
          <Button
            variant="contained"
            onClick={() => {
              submitChangeUsername(user.id, newUsername, auth.token!)
                .then(() => {
                  displaySnackbarVariant(
                    "Username changing... Please wait...",
                    "success"
                  );
                })
                .catch((e) => {
                  displaySnackbarVariant("Failed to change username", "error");
                });
            }}
          >
            Submit
          </Button>
        </>
      )}
      <br />
      {}
      <Button
        variant="contained"
        onClick={() => {
          togglePrivate(user.id, auth.token!)
            .then(() => {
              displaySnackbarVariant("Toggled Private", "success");
            })
            .catch((error) => {
              displaySnackbarVariant("Failed to Toggle Private", "error");
            });
        }}
      >
        Private:
        {user.isPrivate !== null ? user.isPrivate.toString() : "False"} Click to
        Toggle
      </Button>
      {(user.isVerified === null || user.isVerified === false) &&
        auth.user &&
        user.id === auth.user.id && (
          <>
            <Button
              variant="contained"
              onClick={() => {
                sendVerifyEmail(user.email, auth.token!)
                  .then(() => {
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
            >
              Not verified, Click to resend Verify Email
            </Button>
            <br />
          </>
        )}
      {user.isVerified && <div>Verified</div>}
      {user.name}
      <br />
      {user.email}
      <br />
      {user.joinDate}
      <br />
      {user.lastActive}
      <br />
      User has {user.numberOfReviews} review
            */}

      {/* {user.reviews && user.reviews.length > 0 && (
        <div className="gap-4">
          {user.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-green-200 cursor-pointer"
              onClick={() => {
                router.push(`/review/${review.id}`);
              }}
            >
              <br />
              {review.reviewedGame.name}
              <br />
              {review.score}
              <br />
              {review.createdAt}
              <br />
              {review.comment}
            </div>
          ))}
        </div>
      )} */}
    </>
  );
}

