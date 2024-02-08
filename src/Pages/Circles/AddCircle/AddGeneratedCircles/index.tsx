import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { addCirclePageStatus } from "../../../../utils/constants";
import { CircleInterface } from "../../../../types/circle";
import Loading from "../../../../components/Loading";
import { Button } from "../../../../components/GeneralButton";
import AutoCircleItem from "../../../../components/AutoCircleItem";
import { getSpecificNumberOfWords } from "../../../../utils/helpers";
import CircleItem from "../../../../components/CircleItem";

interface AddGeneratedCirclesInterface {
  setPageStatus: Dispatch<SetStateAction<number>>;
  setAddPageStatus: Dispatch<SetStateAction<number>>;
  url: string;
}

const AddGeneratedCircles = ({
  setPageStatus,
  setAddPageStatus,
  url,
}: AddGeneratedCirclesInterface) => {
  const [circles, setCircles] = useState<CircleInterface[]>([]);
  const [recommendedCircles, setRecommendedCircles] = useState<
    CircleInterface[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGettingRecommendedCircles, setIsGettingRecommendedCircles] =
    useState(false);

  const getCircles = useCallback(() => {
    setIsLoading(true);
    setRecommendedCircles([])
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage(
        { action: "getPageContent", tabId: tabs[0].id },
        (response) => {
          chrome.runtime.sendMessage(
            {
              action: "getGeneratedCircles",
              pageUrl: url,
              pageContent: response,
            },
            (res1) => {
              console.log("Generated circles: ", res1);
              if (res1?.error && res1?.error === "context_length_exceeded") {
                const limitedWords = getSpecificNumberOfWords(response, 5000);
                chrome.runtime.sendMessage(
                  {
                    action: "getGeneratedCircles",
                    pageUrl: url,
                    pageContent: limitedWords,
                  },
                  (res2) => {
                    console.log("Generated circles with limited words: ", res2);
                    if (res2.length >= 5) {
                      setCircles(res2);
                    }
                    setIsLoading(false);
                  }
                );
              } else {
                if (res1.length >= 5) {
                  setCircles(res1);
                }
                setIsLoading(false);
              }
            }
          );
        }
      );
    });
  }, [url]);

  useEffect(() => {
    getCircles();
  }, [getCircles]);

  const tags: string[] = useMemo(() => {
    const allTags = circles.map((circle) => circle.tags).flat();
    return allTags.filter((tag, index, array) => array.indexOf(tag) === index);
  }, [circles]);

  const getRecommendedCircles = useCallback(() => {
    setIsGettingRecommendedCircles(true);
    chrome.runtime.sendMessage(
      {
        action: "getRecommendedCircles",
        tags,
      },
      (response) => {
        setRecommendedCircles(response);
        setIsGettingRecommendedCircles(false);
      }
    );
  }, [tags]);

  useEffect(() => {
    if (tags.length > 0) {
      getRecommendedCircles();
    }
  }, [tags, getRecommendedCircles]);

  return (
    <div className="w-full h-full pt-5 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-semibold">Choose a circle</p>
        <button
          onClick={() => setAddPageStatus(addCirclePageStatus.SELECT_OPTION)}
          className="bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Back
        </button>
      </div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 transform self-center border-black py-4 ">
          <Loading />
        </div>
      )}
      {!isLoading && circles.length === 0 && (
        <div className="w-full flex items-center justify-center">
          <p className="text-base leading-normal font-bold">
            There are no generated circles for this page
          </p>
        </div>
      )}
      <div className="overflow-y-auto overflow-x-hidden scrollbar-none mb-9">
        {!isLoading && circles.length > 0 && (
          <div className="w-full">
            {circles.map((circle, index) => (
              <AutoCircleItem
                key={index}
                circle={circle}
                url={url}
                setPageStatus={setPageStatus}
              />
            ))}
          </div>
        )}
        {!isLoading &&
          !isGettingRecommendedCircles &&
          recommendedCircles.length === 0 && (
            <p className="text-base leading-normal font-bold">
              There are no recommended circles
            </p>
          )}
        {!isGettingRecommendedCircles && recommendedCircles?.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-base leading-normal font-bold">
              Recommended circles on this page
            </p>
            {recommendedCircles.map((circle, index) => (
              <CircleItem key={index} circle={circle} url={url} />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end sticky bottom-5 w-full">
        <Button onClick={getCircles} disabled={isLoading}>
          {isLoading ? "Generating" : "Generate New"}
        </Button>
      </div>
    </div>
  );
};

export default AddGeneratedCircles;
