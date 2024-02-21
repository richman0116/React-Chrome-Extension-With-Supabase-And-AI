import { useCallback, useEffect, useState, useMemo } from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";
import { CircleInterface } from "../../../types/circle";

interface IMyCircles {
  url: string;
  currentPageCircleIds: string[];
}

const MyCircles = ({ url, currentPageCircleIds }: IMyCircles) => {
  const [userCircles, setUserCircles] = useState<CircleInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getUserCircles = useCallback(async () => {
    if (url !== "") {
      chrome.runtime.sendMessage({ action: "getUserCircles" }, (response) => {
        if (response.error) {
          setUserCircles([]);
          setIsLoading(false);
        } else {
          if (response.data) {
            setUserCircles(response.data);
            setIsLoading(false);
          } else {
            setUserCircles([]);
            setIsLoading(false);
          }
        }
      });
    }
  }, [url]);

  useEffect(() => {
    getUserCircles();
  }, [getUserCircles]);

  const claimAvailableCircles = useMemo(
    () =>
      userCircles.filter(
        (userCircle) => !currentPageCircleIds.includes(userCircle.id)
      ),
    [currentPageCircleIds, userCircles]
  );

  const resultText = useMemo(() => {
    if (!isLoading && claimAvailableCircles.length > 0) {
      if (claimAvailableCircles.length > 0) {
        return "Link your circles to this page";
      } else {
        return "";
      }
    }
  }, [isLoading, claimAvailableCircles]);

  return (
    <div className="h-full w-full flex flex-col justify-between">
      <div className="w-full">
        {!isLoading && (
          <p className="text-xl font-medium text-primary">{resultText}</p>
        )}
      </div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-black py-4 ">
          <Loading />
        </div>
      )}

      {!isLoading && claimAvailableCircles.length > 0 && (
        <div className="w-full">
          {claimAvailableCircles.map((userCircle, index) => (
            <CircleItem
              key={index}
              circle={userCircle}
              isOnClaimPage
              url={url}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default MyCircles;
