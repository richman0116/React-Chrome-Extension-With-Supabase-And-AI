import { useCallback, useEffect, useMemo, useState } from "react";

import CirclList from "./CirclesList";
import { CircleInterface } from "../../types/circle";
import Header from "../../components/Header";
import MyCircles from "./MyCircles";
import RecommendedCircles from "./RecommendedCircles";

const Circles = () => {
  const [circles, setCircles] = useState<CircleInterface[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentPageCircleIds = useMemo(
    () => circles.map((circle) => circle.id),
    [circles]
  );

  const getURLPromise: () => Promise<string> = useCallback(() => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
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

  const getCircles = useCallback(async () => {
    if (currentUrl) {
      chrome.runtime.sendMessage({ action: "getCircles", url: currentUrl }, (response) => {
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
  }, [currentUrl]);

  useEffect(() => {
    getCircles();
  }, [getCircles]);

  const resultText = useMemo(() => {
    if (!isLoading) {
      if (circles.length > 1) {
        return `${circles.length} circles on this page`;
      } else {
        return `${circles.length} circle on this page`;
      }
    }
  }, [circles, isLoading]);

  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
      <Header />
      <div className="w-full sticky top-0 bg-white py-3 z-50">
        <p className=" text-3.5xl font-medium capitalize text-primary">
          {resultText}
        </p>
      </div>
      <CirclList url={currentUrl} circles={circles} isLoading={isLoading} />
      <RecommendedCircles url={currentUrl} currentPageCircleIds={currentPageCircleIds} />
      <MyCircles
        url={currentUrl}
        currentPageCircleIds={currentPageCircleIds}
      />
    </div>
  );
};

export default Circles;
