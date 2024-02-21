import { useCallback, useEffect, useState } from "react";

import Circles from "./Pages/Circles";
import Login from "./Pages/Login";
import Loading from "./components/Loading";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  const [username, setUsername] = useState<string>("");

  const getUsername = useCallback(() => {
    if (username !== "") {
      // do nothing
    } else {
      chrome.runtime.sendMessage(
        { action: "getUsername" },
        (response) => {
          if (chrome.runtime.lastError) {
            // Handle error
            console.error(chrome.runtime.lastError);
          } else {
            setUsername(response);
          }
        }
      );
    }
  }, [username]);

  const checkIfLoggedIn = useCallback(() => {
    chrome.runtime.sendMessage(
      { action: "checkLoggedIn" },
      (response) => {
        if (chrome.runtime.lastError) {
          setIsChecking(false);
          // Handle error
          // console.error(chrome.runtime.lastError);
        } else {
          if (response === true) {
            setIsLoggedIn(true);
            setIsChecking(false);
            getUsername();
          } else {
            setIsLoggedIn(false);
            setIsChecking(false);
            // Set up the listener
            const messageListener = (message: any) => {
              if (message.loggedIn !== undefined) {
                setIsLoggedIn(message.loggedIn);
                if (message.loggedIn) {
                  getUsername();
                }
              }
            };
            chrome.runtime.onMessage.addListener(messageListener);
            // Cleanup listener on unmount
            return () => {
              chrome.runtime.onMessage.removeListener(messageListener);
            };
          }
        }
      }
    );
  }, [getUsername]);

  useEffect(() => {
    checkIfLoggedIn();
  }, [checkIfLoggedIn]);

  return (
    <div className="w-full h-full p-5 flex flex-col items-center justify-center">
      {isChecking ? (
        <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4">
          <Loading />
        </div>
      ) : (
          <>{isLoggedIn ? <Circles setIsLoggedIn={setIsLoggedIn} /> : <Login setIsLoggedIn={setIsLoggedIn} />}</>
        )}
      </div>
  );
};

export default App;
