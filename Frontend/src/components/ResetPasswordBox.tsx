import { CustomInput } from "@/components/CustomInput";
import { displaySnackbarVariant } from "@/utils/DisplaySnackbar";
import { validatePassword } from "@/utils/Regex";
import ErrorIcon from "@mui/icons-material/Error";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  Link,
  Typography,
  styled,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type ResetPasswordProps = {
  token: string;
  errorMessage: string;
};

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  fontSize: 46,
  color: theme.palette.error.main,
}));

async function resetPassword(token: String, password: String) {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/reset-password`,
      { resetPasswordToken: token, password: password },
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
      return null;
    } else {
      console.debug("Failed to reset password (response)", response);
      return response.data.message;
    }
  } catch (error: any) {
    console.error("Failed to reset password (error)", error);
    return error.response.data.message;
  }
}

const ResetPasswordBox = ({ token, errorMessage }: ResetPasswordProps) => {
  const [noToken, setNoToken] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [resetError, setResetError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  function verifyPassword(): boolean {
    if (
      !validatePassword(newPassword) ||
      !validatePassword(confirmNewPassword)
    ) {
      setPasswordError(
        "Your password should have:\n 1. A minimum of 8 and a maximum of 16 characters\n 2. Contains both numbers and letters"
      );
      return false;
    } else if (newPassword === "" || confirmNewPassword === "") {
      setPasswordError("New Password cannot be empty");
      return false;
    } else if (newPassword !== confirmNewPassword) {
      setPasswordError("Password does not match");
      return false;
    } else {
      setPasswordError("");
    }
    return true;
  }

  async function handlePasswordReset(token: String, password: String) {
    if (!verifyPassword()) {
      return;
    }

    setIsLoading(true);
    const response = await resetPassword(token, password);
    if (response === null) {
      displaySnackbarVariant(
        "Password reset successfully. Please login with your new password.",
        "success"
      );
      setIsSuccess(true);
    } else {
      setResetError(response);
    }
    setIsLoading(false);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {noToken === false && errorMessage === null ? (
        <>
          <Typography
            variant="h5"
            sx={{ marginBottom: 4, fontWeight: 600, textAlign: "center" }}
          >
            Enter a new password to update your password
          </Typography>

          {!isSuccess ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2.5,
              }}
            >
              <FormControl variant="standard" error={!!passwordError}>
                <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
                  New Password
                </InputLabel>
                <CustomInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={!!passwordError}
                  onBlur={() => verifyPassword()}
                  inputProps={{ maxLength: 16 }}
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                />
                <FormHelperText sx={{ whiteSpace: "pre-wrap" }}>
                  {passwordError}
                </FormHelperText>
              </FormControl>

              <FormControl variant="standard" error={!!passwordError}>
                <InputLabel shrink sx={{ fontWeight: 500, fontSize: "20px" }}>
                  Confirm New Password
                </InputLabel>
                <CustomInput
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  error={!!passwordError}
                  onBlur={() => verifyPassword()}
                  inputProps={{ maxLength: 16 }}
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  autoComplete="new-password"
                />
                <FormHelperText sx={{ whiteSpace: "pre-wrap" }}>
                  {passwordError}
                </FormHelperText>
              </FormControl>

              {resetError !== "" && (
                <Typography
                  variant="body1"
                  color="error"
                  sx={{ fontWeight: 500, textAlign: "center" }}
                >
                  {resetError}
                </Typography>
              )}

              <Box sx={{ m: 1, position: "relative" }}>
                <Button
                  variant="contained"
                  type="submit"
                  size="large"
                  fullWidth
                  onClick={() => handlePasswordReset(token, newPassword)}
                  disabled={isLoading}
                >
                  Confirm Update
                </Button>
                {isLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            </Box>
          ) : (
            <>
              <Typography
                variant="body1"
                color="secondary"
                sx={{ fontWeight: 500, textAlign: "center" }}
              >
                Your password has been successfully updated. Please login with
                your new password.
              </Typography>

              <Button
                variant="text"
                sx={{ textDecoration: "underline", marginTop: 2.5 }}
                size="small"
                LinkComponent={Link}
                href="/login"
              >
                Back To Login
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            {errorMessage === null ? (
              <>
                <StyledErrorIcon />
                <Typography
                  variant="body1"
                  color="error"
                  sx={{ fontWeight: 600, textAlign: "center" }}
                >
                  The link you have entered is not valid for resetting your
                  password. Please check your email for the correct link if you
                  have requested a password reset.
                </Typography>
              </>
            ) : (
              <>
                <StyledErrorIcon />
                <Typography
                  variant="body1"
                  color="error"
                  sx={{ fontWeight: 600, textAlign: "center" }}
                >
                  You cannot use this Token to reset your password because it is
                  either expired or invalid. Please request a new password reset
                  link.
                </Typography>
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ResetPasswordBox;

