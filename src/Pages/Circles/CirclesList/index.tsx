import { useEffect } from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";

import classNames from "classnames";
import { useCircleContext } from "../../../context/CircleContext";

const CirclList = () => {
  const { circles, isLoading, currentUrl: url} = useCircleContext()
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
    <div className={classNames("w-full", {
      "hidden": circles.length === 0
    })}>
      <div className="w-full flex flex-col gap-2">
        {isLoading && (
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center nborder-gray-600 py-4 ">
            <Loading />
          </div>
        )}

        {!isLoading && circles.length > 0 && (
          <div className="w-full flex flex-col gap-1">
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
