import {
  SetStateAction,
  Dispatch,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";

import { CircleInterface } from "../../../types/circle";
import { isMainURL } from "../../../utils/helpers";
import { circlePageStatus } from "../../../utils/constants";
import { Button } from "../../../components/GeneralButton";

interface ICircleList {
  setPageStatus: Dispatch<SetStateAction<number>>;
  circles: CircleInterface[]
  setCircles: Dispatch<SetStateAction<CircleInterface[]>>;
  url: string;
}

const CirclList = ({ setPageStatus, url, circles, setCircles }: ICircleList) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const getCircles = useCallback(async () => {
    console.log("CirclesView: get url result: ", url);
    if (url !== "") {
      chrome.runtime.sendMessage({ action: "getCircles", url }, (response) => {
        if (response.error) {
          setCircles([]);
          setIsLoading(false);
        } else {
          if (response.data) {
            setCircles(response.data);
            setIsLoading(false);
          } else {
            setCircles([]);
            setIsLoading(false);
          }
        }
      });
    }
  }, [setCircles, url]);

  useEffect(() => {
    getCircles();
  }, [getCircles]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chrome.runtime.sendMessage(
        { action: "showCircleCount", url },
        (response) => {
          console.log('circle bagdge number has been updated')
        }
      );
    });
  }, [])

  const resultText = useMemo(() => {
    if (!isLoading && circles.length > 0) {
      if (circles.length > 1) {
        return "We found these circles for you on this page";
      } else {
        return "We found this circle for you on this page";
      }
    }
  }, [isLoading, circles]);

  const isMainUrl = isMainURL(url);

  return (
    <div className="flex flex-col justify-between h-full w-full gap-2">
      <div className="w-full">
        <h2 className="text-2xl font-bold text-gray-800">Eden</h2>
        {!isLoading && circles.length > 0 && (
          <p className="text-base leading-normal font-semibold text-gray-600 pt-1">{resultText}</p>
        )}
      </div>

      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-gray-600 py-4 ">
          <Loading />
        </div>
      )}

      {!isLoading && circles.length === 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-base leading-normal font-bold">
            There are no circles on this page
          </p>
        </div>
      )}

      {!isLoading && circles.length > 0 && (
        <div className="h-[70%] overflow-y-auto overflow-x-hidden scrollbar-none">
          {circles.map((circle, index) => (
            <CircleItem key={index} circle={circle} url={url} />
          ))}
        </div>
      )}
      <div className="flex justify-end sticky bottom-5 w-full">
        {!isMainUrl ? (
          <div className="flex w-full justify-evenly gap-2">
            <Button
              onClick={() => setPageStatus(circlePageStatus.ADD_CIRCLE)}
            >
              Add New
            </Button>
            <Button
              onClick={() => setPageStatus(circlePageStatus.CLAIM_CIRCLE)}
            >
              Claim For My Circles
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CirclList;
