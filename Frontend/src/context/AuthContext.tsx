import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/type/user";
import { isUserAuthorised, refreshAccessToken, getUserInfo } from "@/libs/authHelper";

interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  token: string | null | undefined;
  setToken: React.Dispatch<React.SetStateAction<string | null | undefined>>
  isUserLoading: boolean;
}

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextProps | null>(null)

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [isUserLoading, setIsUserLoading] = useState<boolean>(token === undefined)
  const router = useRouter()

  const refreshSession = () => {
    if(!token) return;
    const isAuthorised = isUserAuthorised(token);
    if(!isAuthorised){
      refreshAccessToken().then(async (newToken) => {
        if(newToken !== null) {
          let user: User | null = null;
          setToken(newToken);
          user = await getUserInfo(newToken);
          setUser(user);
        }
        else {
          setToken(null);
          setUser(null);
          router.push('/login');
        }
      })
    }
  }

  //Refresh session every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSession();
    }, 1800000);
    return () => clearInterval(interval);
  })

  // Try to refresh token on first load
  useEffect(() => {
    if(!token && !user){
      refreshAccessToken().then(async (newToken) => {
        if(newToken !== null) {
          let user: User | null = null;
          user = await getUserInfo(newToken);
          setUser(user);
          setToken(newToken);
          setIsUserLoading(false);
        }
        else{
          setToken(null);
          setIsUserLoading(false);
          console.debug('No token found')
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isUserLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if(!context) {
    throw new Error("useAuthContext must be used inside Auth provider");      
  }
  else {
    return context
  }
}