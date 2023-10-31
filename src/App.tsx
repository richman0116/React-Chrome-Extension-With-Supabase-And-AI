import { useCallback, useEffect, useState } from "react";

import AuthContext from "./contexts/AuthContext";
import Circles from "./Pages/Circles";
import Login from "./Pages/Login";

import { extensionId } from "./utils/constants";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [username, setUsername] = useState<string>("");

  const getUsername = useCallback(() => {
    if (username !== "") {
      // do nothing
    } else {
      chrome.runtime.sendMessage(
        extensionId,
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
      extensionId,
      { action: "checkLoggedIn" },
      (response) => {
        if (chrome.runtime.lastError) {
          // Handle error
          // console.error(chrome.runtime.lastError);
        } else {
          if (response === true) {
            setIsLoggedIn(true);
            getUsername();
            // get the current url
            // and the text content
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              // const url = tabs[0].url;
              chrome.runtime.sendMessage(
                { action: "getPageContent", tabId: tabs[0].id },
                (response) => {
                  // setPageContent(response.substring(0, 100));
                }
              );
            });
          } else {
            setIsLoggedIn(false);
            // Set up the listener
            // const messageListener = (message: any) => {
            //   if (message.loggedIn !== undefined) {
            //     setIsLoggedIn(message.loggedIn);
            //     if (message.loggedIn) {
            //       getUsername();
            //     }
            //   }
            // };
            // chrome.runtime.onMessage.addListener(messageListener);
            // // Cleanup listener on unmount
            // return () => {
            //   chrome.runtime.onMessage.removeListener(messageListener);
            // };
          }
        }
      }
    );
  }, [getUsername, setIsLoggedIn]);

  useEffect(() => {
    checkIfLoggedIn();
  }, [checkIfLoggedIn]);

  console.log(isLoggedIn, "kkkk");

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center">
        {isLoggedIn ? <Circles /> : <Login />}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
