import { useCallback, useEffect, useState, useMemo } from "react";

import CircleItem from "../../../../../components/CircleItem";
import Loading from "../../../../../components/Loading";
import { CircleInterface } from "../../../../../types/circle";
import { useCircleContext } from "../../../../../context/CircleContext";

interface IRecommendedCircles {
  circles: CircleInterface[]
  tags: string[]
}

const RecommendedCircles = ({ circles, tags }: IRecommendedCircles) => {
  const { currentUrl: url } = useCircleContext()
  const [recommendedCircles, setRecommendedCircles] = useState<CircleInterface[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRecommendedCircles = useCallback(() => {
    setIsLoading(true);
    chrome.runtime.sendMessage(
      {
        action: "getSimilarCirclesFromTags",
        tags,
      },
      (response) => {
        setRecommendedCircles(response);
        setIsLoading(false);
      }
    );
  }, [tags]);

  useEffect(() => {
    if (tags.length > 0) {
      getRecommendedCircles();
    }
  }, [tags, getRecommendedCircles]);

  const resultText = useMemo(() => {
    if (circles.length > 0 && !isLoading) {
      if (recommendedCircles.length > 0) {
        return "Recommended circles";
      } else {
        return "There are no recommended circles";
      }
    }
  }, [circles.length, isLoading, recommendedCircles.length]);

  return (
    <div className="w-full flex flex-col justify-between gap-3">
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

      {!isLoading && circles.length > 0 && recommendedCircles.length > 0 && (
        <div className="w-full flex flex-col gap-1">
          {recommendedCircles.map((recommendCircle, index) => (
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
