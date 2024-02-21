import { useCallback, useEffect, useState, useMemo } from "react";

import CircleItem from "../../../components/CircleItem";
import Loading from "../../../components/Loading";
import { CircleInterface } from "../../../types/circle";

interface IRecommendedCircles {
  url: string;
  currentPageCircleIds: string[];
}

const RecommendedCircles = ({ url, currentPageCircleIds }: IRecommendedCircles) => {
  const [recommendedCircles, setRecommendedCircles] = useState<CircleInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getRecommendedCircles = useCallback(async () => {
    if (url !== "") {
      chrome.runtime.sendMessage({ action: "getRecommendedCircles", circleIds: currentPageCircleIds }, (response) => {
        if (response.error) {
          setRecommendedCircles([]);
          setIsLoading(false);
        } else {
          if (response) {
            setRecommendedCircles(response);
            setIsLoading(false);
          } else {
            setRecommendedCircles([]);
            setIsLoading(false);
          }
        }
      });
    }
  }, [currentPageCircleIds, url]);

  useEffect(() => {
    getRecommendedCircles();
  }, [getRecommendedCircles]);

  const recommendAvailableCircles = useMemo(
    () =>
      recommendedCircles.filter(
        (recommendCircle) => !currentPageCircleIds.includes(recommendCircle.id)
      ),
    [currentPageCircleIds, recommendedCircles]
  );

  const resultText = useMemo(() => {
    if (!isLoading && recommendAvailableCircles.length > 0) {
      if (recommendAvailableCircles.length > 0) {
        return "Recommended circles";
      } else {
        return "";
      }
    }
  }, [isLoading, recommendAvailableCircles]);

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

      {!isLoading && recommendAvailableCircles.length > 0 && (
        <div className="w-full">
          {recommendAvailableCircles.map((recommendCircle, index) => (
            <CircleItem
              key={index}
              circle={recommendCircle}
              url={url}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default RecommendedCircles;
