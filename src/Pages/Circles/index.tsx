import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import AddNewCircle from "./AddCircle";
import CirclList from "./CirclesList";
import LogoutButton from "../../components/LogoutButton";

interface CirclesInterface {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const Circles = ({ setIsLoggedIn }: CirclesInterface) => {
  const [showList, setShowList] = useState<boolean>(true);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  const getURLPromise: () => Promise<string> = useCallback(() => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("CirclesView: getURL: tabs[0].url: ", tabs[0].url);
        const url = tabs[0].url;
        // setUrl(url);
        console.log("CirclesView: setUrl(url): ", url);
        resolve(url || "");
      });
    });
  }, []);

  const getURL = useCallback(async () => {
    const urlResult = await getURLPromise();
    setCurrentUrl(urlResult);
  }, [getURLPromise]);

  useEffect(() => {
    getURL();
  }, [getURL]);

  return (
    <div className="h-full w-full">
      <div className="w-full flex flex-row-reverse items-center justify-between px-5">
        <LogoutButton setIsLoggedIn={setIsLoggedIn} />
      </div>
      {showList ? (
        <CirclList setShowList={setShowList} url={currentUrl} />
      ) : (
        <AddNewCircle setShowList={setShowList} url={currentUrl} />
      )}
    </div>
  );
};

export default Circles;
