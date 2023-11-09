import { setCookie } from 'cookies-next';
import { getCookie } from 'cookies-next';
import { deleteCookie } from 'cookies-next';
import { User } from "@/type/user"
import axios from "axios";
import jwt from "jsonwebtoken"

const NEXT_PUBLIC_JWT_KEY  = process.env.NEXT_PUBLIC_JWT_KEY
const NEXT_PUBLIC_BACKEND_PATH_PREFIX  = process.env.NEXT_PUBLIC_BACKEND_PATH_PREFIX

if(!NEXT_PUBLIC_JWT_KEY){
  throw new Error("NEXT_PUBLIC_JWT_KEY not found, check .env file")
}

export function setAuthCookies(refresh_token:string | null, isTemporary: boolean): void { 
  if(refresh_token){
    if(!isTemporary){
      setCookie('_u-token', refresh_token, {
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 
      })
    }
    else{
      setCookie('_u-token', refresh_token, {
        secure: true,
        sameSite: 'none',
      })
    }
  }
} 

export function removeAuthCookies(): void {
  deleteCookie('_u-token')
}

 async function getUserInfoByAccessToken(access_token:string) {
  let user: User | null = null;

  await axios({
    method: 'POST',
    url: `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/userAuth`,
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    }
  })
  .then(function (response) {
    user = response.data;
  })
  .catch(function (error) {
    console.error("access_token invalid: ", error);
  });

  return user;
} 

export async function refreshAccessToken() {
  let refresh_token = getCookie('_u-token')?.valueOf();
  let access_token: string | null = null;

  if(!refresh_token){
    return null;
  }

  await axios({
    method: 'POST',
    url: `${NEXT_PUBLIC_BACKEND_PATH_PREFIX}api/auth/refreshToken`,
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${refresh_token}`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    }
  })
  .then(function (response) {
    access_token = response.data?.access_token;
    console.debug("token refreshed, new refresh_token: ", refresh_token, "old refresh_token: ", response.data?.refresh_token);
  })
  .catch(function (error) {
    removeAuthCookies()
    console.error("refresh_token invalid: ", error, "refresh_token: ", refresh_token);
  });

  return access_token;
} 

export async function getUserInfo(access_token: string | null) {
  let user: User | null = null;

  if(access_token){
    if(isUserAuthorised(access_token)){
      try{
        user = await getUserInfoByAccessToken(access_token)
      }
      catch(error){
        console.error("getUserInfoByAccessToken error: ", error)
      }
    }
  }

  return user;
}

export function isUserAuthorised(token: string): boolean {
  if (NEXT_PUBLIC_JWT_KEY) {
    jwt.verify(token, Buffer.from(NEXT_PUBLIC_JWT_KEY, 'base64'), function(err, decoded) {
      if (err) {
        console.error("jwt.verify error: ", err)
        return false;
      }
    });
    return true;
  }
  console.debug("NEXT_PUBLIC_JWT_KEY not found")
  return false;
}