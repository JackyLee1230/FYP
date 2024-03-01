import { Box, Button, Typography, IconButton, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import axios from "axios";
import { use, useState } from "react";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { displaySnackbarVariant } from '@/utils/DisplaySnackbar';
import { CustomInput } from "./CustomInput";
import { validateUsername } from "@/utils/Regex";
import router from "next/router";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type UpdateUsernameBoxProps = {
  setUpdateUsernameOpen: React.Dispatch<React.SetStateAction<boolean>>;
  oldName?: string;
  userId?: number;
  token?: string | null;
};

const handleUsernameUpdate = async (
  id: number,
  username: string,
  token: string,
  setUpdateUsernameOpen: React.Dispatch<React.SetStateAction<boolean>>
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
    if (response.status === 200) {
      displaySnackbarVariant("Your username has been updated successfully", "success");
      setUpdateUsernameOpen(false);
      router.reload();
    } 
  } catch (error: any) {
    console.error(error);
    displaySnackbarVariant(error?.response?.data?.message || "Failed to update your username, please try again", "error");
  }
};

const UpdateUsernameBox = ({ setUpdateUsernameOpen, oldName, userId, token }: UpdateUsernameBoxProps) => {
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  function verifyUsername(): boolean {
    if (!validateUsername(username)) {
      setUsernameError(
        "Your username must be 4 to 14 characters long with no spaces or @ symbols."
      );
      return false;
    } else if (oldName === username) {
      setUsernameError("Your new username must be different from your current one.");
      return false;
    } else {
      setUsernameError("");
      return true;
    }
  }

  if(!userId || !token) {
    setUpdateUsernameOpen(false);
    return(
      <></>
    );
  }
  
  return (
    <Box
      sx={{
        width: "fit-content",
        background: "white", 
        borderRadius: "16px", 
        padding: "24px 36px", 
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        position: "relative",
        
        [theme.breakpoints.down("sm")]: {
          padding: "18px 24px",
          boxShadow: "none",
        }
      }}
    >
      <IconButton 
        size="large" 
        onClick={() => setUpdateUsernameOpen(false)} 
        sx={{
          position: "absolute",
          top: 24,
          right: 36,

          [theme.breakpoints.down("sm")]: {
            top: 12,
            right: 18,
          }
        }}
      >
        <CloseRoundedIcon/>
      </IconButton>

      <Typography variant={isMobile ? "h5" : "h4"} color="primary.main" sx={{fontWeight: 700}}>Change Your Username</Typography>
      <DialogContent 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "4px",
          
          [theme.breakpoints.down("sm")]: {
            padding: "16px 12px",
          }
        }}
      >
        <Typography variant={isMobile ? "subtitle2" : "subtitle1"} color="text.secondary">Input a new username</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <CustomInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            onBlur={verifyUsername}
            id="username"
            name="username"
            autoComplete="new-username"
            sx={{
              width: "100%",
              maxWidth: "350px",
              [theme.breakpoints.down("sm")]: {
                maxWidth: "100%",
              }
            }}
          />
          <Typography 
            variant="subtitle2" 
            color="error" 
            sx={{
              maxWidth: "350px",
              [theme.breakpoints.down("sm")]: {
                maxWidth: "100%",
              }
            }}
          >
            {usernameError}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={() => {
            setUpdateUsernameOpen(false);
          }}
        >
          Cancel
        </Button>
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            onClick={async () => {
              setIsLoading(true);
              await handleUsernameUpdate(userId, username, token, setUpdateUsernameOpen);
              setIsLoading(false);
            }}
            disabled={!username || !!usernameError || isLoading}
          >
            Save
          </Button>
          {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
          )}
        </Box>
      </DialogActions>
    </Box>
  );
};

export default UpdateUsernameBox;

