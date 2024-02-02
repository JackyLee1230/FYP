import { Box, Button, Typography, IconButton, CircularProgress } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import axios from "axios";
import { useState } from "react";
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
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
      style={{
        width: "fit-content",
        background: "white", 
        borderRadius: "16px", 
        padding: "24px 36px", 
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <IconButton 
        size="large" 
        onClick={() => setUpdateUsernameOpen(false)} 
        sx={{
          position: "absolute",
          top: 24,
          right: 36,
        }}
      >
        <CloseRoundedIcon/>
      </IconButton>

      <DialogTitle>
        <Typography variant="h4" color="primary.main" sx={{fontWeight: 700}}>Change Your Username</Typography>
      </DialogTitle>
      <DialogContent 
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "4px",
        }}
      >
        <DialogContentText>
          <Typography variant="subtitle1" color="text.secondary">Input a new username</Typography>
        </DialogContentText>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
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
          />
          <Typography variant="subtitle2" color="error" sx={{maxWidth: "350px"}}>{usernameError}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            setUpdateUsernameOpen(false);
          }}
        >
          Cancel
        </Button>
        <Box sx={{ m: 1, position: 'relative' }}>
          <Button
            variant="contained"
            size="large"
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

