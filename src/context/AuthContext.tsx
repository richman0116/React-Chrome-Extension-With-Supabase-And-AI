import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  isChecking: boolean;
  avatarUrl: string;
  setAvatarUrl: Dispatch<SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isChecking: true,
  avatarUrl: "",
  setAvatarUrl: () => {}
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderInterface {
  children: React.ReactNode;
}

export const AuthContextProvider = ({
  children,
}: AuthContextProviderInterface) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("")

  const checkIfLoggedIn = useCallback(() => {
    chrome.runtime.sendMessage({ action: "checkLoggedIn" }, (response) => {
      if (chrome.runtime.lastError) {
        setIsChecking(false);
        console.error(chrome.runtime.lastError);
      } else {
        if (response === true) {
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    checkIfLoggedIn();
  }, [checkIfLoggedIn]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isChecking, avatarUrl, setAvatarUrl }}
    >
      {children}
    </AuthContext.Provider>
  );
};
