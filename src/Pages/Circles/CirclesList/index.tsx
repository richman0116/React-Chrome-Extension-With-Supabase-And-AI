import { useEffect } from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";

import { CircleInterface } from "../../../types/circle";

interface ICircleList {
  circles: CircleInterface[];
  isLoading: boolean;
  url: string;
}

const CirclList = ({ url, circles, isLoading }: ICircleList) => {
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chrome.runtime.sendMessage(
        { action: "showCircleCount", url },
        (response) => {
          console.log("circle bagdge number has been updated");
        }
      );
    });
  }, []);

  return (
    <div className="flex flex-col justify-between h-full w-full gap-2">
      <div className="w-full flex flex-col gap-2">
        {isLoading && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center nborder-gray-600 py-4 ">
            <Loading />
          </div>
        )}

        {!isLoading && circles.length > 0 && (
          <div className="w-full">
            {circles.map((circle, index) => (
              <CircleItem key={index} circle={circle} url={url} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CirclList;
