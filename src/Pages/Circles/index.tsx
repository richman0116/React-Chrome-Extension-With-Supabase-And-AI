import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import AddNewCircle from "./AddCircle";
import CirclList from "./CirclesList";
import LogoutButton from "../../components/LogoutButton";
import { circlePageStatus } from "../../utils/constants";

interface CirclesInterface {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>
}

const Circles = ({ setIsLoggedIn }: CirclesInterface) => {
  const [pageStatus, setPageStatus] = useState<number>(circlePageStatus.CIRCLE_LIST);
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
    <div className="h-full w-full px-5">
      <div className="w-full flex flex-row-reverse items-center justify-between">
        <LogoutButton setIsLoggedIn={setIsLoggedIn} />
      </div>
      { pageStatus === circlePageStatus.CIRCLE_LIST && <CirclList setPageStatus={setPageStatus} url={currentUrl} /> }
      { pageStatus === circlePageStatus.ADD_CIRCLE && <AddNewCircle setPageStatus={setPageStatus} url={currentUrl} /> }
    </div>
  );
};

export default Circles;
