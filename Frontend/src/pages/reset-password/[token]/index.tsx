"use client";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;

  let user = null;
  let errorMessage = null;

  try {
    // Fetch the game data from an API using Axios
    const response = await axios.post(
      "http://localhost:8080/api/user/getUserByResetPasswordToken",
      { resetPasswordToken: token }
    );
    if (response.status === 200) {
      user = await response.data;
    } else {
      errorMessage = response.statusText;
    }
  } catch (error: any) {
    errorMessage = error.toString();
    console.error(error);
  }

  return {
    props: {
      token,
      errorMessage,
    },
  };
};

async function sendForgotPassword(email: string) {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/forgot-password",
      {
        email: email,
      }
    ); //
    if (response.status === 200) {
      console.debug("Forgot password req sent successfully");
    } else {
      console.debug("Failed to forgot password");
    }
  } catch (error) {
    console.error("Failed to forgot password");
  }
}

export default function ResetPassword({
  token,
  errorMessage,
}: {
  token: string;
  errorMessage: string;
}) {
  const [noToken, setNoToken] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [pwNotMatch, setPwNotMatch] = useState(false);

  async function resetPassword(token: String, password: String) {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        { resetPasswordToken: token, password: password }
      );
      if (response.status === 200) {
        console.log("Password reset successfully");
      } else {
        console.debug("Failed to reset password");
      }
    } catch {
      console.error("Failed to reset password");
    }
  }

  useEffect(() => {
    setPwNotMatch(
      newPassword !== newPasswordAgain ||
        newPassword === "" ||
        newPasswordAgain === ""
    );
  }, [newPassword, newPasswordAgain]);

  return (
    <>
      {noToken === false && errorMessage === null ? (
        <div
          style={{ margin: "auto", display: "flex", flexDirection: "column" }}
        >
          {/* {token.toString()} */}
          <input
            type="text"
            name="password"
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "40%" }}
          />
          <input
            type="text"
            name="passwordAgain"
            onChange={(e) => setNewPasswordAgain(e.target.value)}
            style={{ width: "40%" }}
          />

          <button
            disabled={pwNotMatch}
            onClick={() => {
              resetPassword(token, newPassword);
            }}
          >
            Submit
          </button>
        </div>
      ) : (
        <>
          {errorMessage === null ? (
            <>
              <div>If you requested a pw reset, pls check your email</div>
            </>
          ) : (
            <>
              <div>Token is invalid/expired</div>
            </>
          )}
        </>
      )}
    </>
  );
}

