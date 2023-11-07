import axios from "axios";
import { removeAuthCookies } from "@/libs/authHelper";

export async function login(username: string, password: string) {
  const body = {
    name: username,
    password: password,
  };
  const response = await axios.post(
    "http://localhost:8080/api/auth/login",
    body
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
    "http://localhost:8080/api/auth/register",
    body
  );
  return response.data;
}

export async function logout(access_token: string) {
  await axios({
    method: "POST",
    url: "http://localhost:8080/api/auth/logout",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Access-Control-Allow-Origin": "*",
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

