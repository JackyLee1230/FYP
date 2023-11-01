import axios from "axios";
import { useState } from "react";

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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  return (
    <div style={{ margin: "auto" }}>
      <input
        type="email"
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "40%" }}
      />
      <button>Submit</button>
    </div>
  );
}

