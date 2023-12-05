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
import { isMainURL } from "../../../utils/helpers";

interface ICircleList {
  setShowList: Dispatch<SetStateAction<boolean>>;
  url: string;
}

const CirclList = ({ setShowList, url }: ICircleList) => {
  const [circles, setCircles] = useState<CircleInterface[]>([]);
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
  }, [url]);

  useEffect(() => {
    getCircles();
  }, [getCircles]);

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
    <div className="flex flex-col justify-between h-full w-full">
      <div className="w-full">
        <h1 className="text-xl font-bold leading-normal">Eden</h1>
        {!isLoading && circles.length > 0 && (
          <p className="text-base leading-normal font-bold ">{resultText}</p>
        )}
      </div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-black py-4 ">
          <Loading />
        </div>
      )}

      {!isLoading && circles.length === 0 && (
        <div className="w-full h-[70%] flex items-center justify-center">
          <p className="text-base leading-normal font-bold">
            There are no circles on this page
          </p>
        </div>
      )}

      {!isLoading && circles.length > 0 && (
        <div className="h-[70%] overflow-y-auto overflow-x-hidden scrollbar-none">
          {circles.map((circle, index) => (
            <CircleItem key={index} circle={circle} />
          ))}
        </div>
      )}
      <div className="flex justify-end my-2 sticky bottom-5 w-full">
        {!isMainUrl ? (
          <button
            onClick={() => setShowList(false)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add New
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default CirclList;
