import { User } from "@/type/user";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Button, Link, Typography, styled } from "@mui/material";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

type ResetPasswordProps = {
  user: User | null;
  errorMessage: string | null;
};

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  fontSize: 46,
  color: theme.palette.error.main,
}));

const VerifyAccountBox = ({ user, errorMessage }: ResetPasswordProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {errorMessage != null ? (
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
          <StyledErrorIcon />
          <Typography
            variant="body1"
            color="error"
            sx={{ fontWeight: 600, textAlign: "left" }}
          >
            The link you have entered is not valid for verifying your account.{" "}
            <br />
            Please check the email you created your account with for the correct
            link.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="body1"
            color="secondary"
            sx={{ fontWeight: 500, textAlign: "center" }}
          >
            Your account has been successfully verified. Thank you!
          </Typography>
          {user != null && (
            <Button
              variant="text"
              sx={{ textDecoration: "underline", marginTop: 2.5 }}
              size="small"
              LinkComponent={Link}
              href={`/user/${user.id}`}
            >
              Back To Profile
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default VerifyAccountBox;

