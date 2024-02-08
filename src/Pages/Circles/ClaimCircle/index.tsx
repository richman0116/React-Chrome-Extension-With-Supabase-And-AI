import {
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  Dispatch,
  useMemo,
} from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";
import { CircleInterface } from "../../../types/circle";
import { circlePageStatus } from "../../../utils/constants";

interface ClaimCircleInterface {
  setPageStatus: Dispatch<SetStateAction<number>>;
  url: string;
  currentPageCircleIds: string[];
}

const ClaimCircle = ({ setPageStatus, url, currentPageCircleIds }: ClaimCircleInterface) => {
  const [userCircles, setUserCircles] = useState<CircleInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getUserCircles = useCallback(async () => {
    console.log("CirclesView: get url result: ", url);
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

  const claimAvailableCircles = useMemo(() => userCircles.filter((userCircle) => !currentPageCircleIds.includes(userCircle.id) ), [currentPageCircleIds, userCircles])

  const resultText = useMemo(() => {
    if (!isLoading && claimAvailableCircles.length > 0) {
      if (claimAvailableCircles.length > 1) {
        return "We found these circles that you can claim";
      } else {
        return "We found this circle that you can claim";
      }
    }
  }, [isLoading, claimAvailableCircles]);

  return (
    <div className="h-full w-full py-5 flex flex-col justify-between">
      <div className="w-full">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Eden</h1>
          <button
            onClick={() => setPageStatus(circlePageStatus.CIRCLE_LIST)}
            className="bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Back
          </button>
        </div>
        {!isLoading && claimAvailableCircles.length > 0 && (
          <p className="text-base leading-normal font-semibold text-gray-600 pt-1">{resultText}</p>
        )}
      </div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-black py-4 ">
          <Loading />
        </div>
      )}

      {!isLoading && claimAvailableCircles.length === 0 && (
        <div className="w-full flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center">
          <p className="text-base leading-normal font-semibold text-gray-600 pt-1">
            There are no circles that you can claim
          </p>
        </div>
      )}

      {!isLoading && claimAvailableCircles.length > 0 && (
        <div className="h-[85%] overflow-y-auto overflow-x-hidden scrollbar-none my-5">
          {claimAvailableCircles.map((userCircle, index) => (
            <CircleItem key={index} circle={userCircle} isOnClaimPage url={url} setPageStatus={setPageStatus} />
          ))}
        </div>
      )}
    </div>
  );
};
export default ClaimCircle;
