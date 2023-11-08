import axios from "axios";
import { removeAuthCookies } from "@/libs/authHelper";

const NEXT_PUBLIC_BACKEND_PATH_PREFIX =
  process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX;

export async function login(username: string, password: string) {
  const body = {
    name: username,
    password: password,
  };
  const response = await axios.post(
    `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/login`,
    body,
    // add header for cors
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    }
  );
  return response.data;
}

export async function register(
  username: string,
  email: string,
  password: string
) {
  const body = {
    name: username,
    email: email,
    password: password,
  };
  const response = await axios.post(
    `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/register`,
    body
  );
  return response.data;
}

export async function logout(access_token: string) {
  await axios({
    method: "POST",
    url: `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/logout`,
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  })
    .then(function (response) {
      console.debug("logout response: ", response);
    })
    .catch(function (error) {
      console.error("logout error: ", error);
    });
  removeAuthCookies();
}

