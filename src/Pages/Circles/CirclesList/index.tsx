import {
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  Dispatch,
} from "react";
import Loading from "../../../components/Loading";

interface ICircleList {
  setShowList: Dispatch<SetStateAction<boolean>>;
  url: string;
}

const CirclList = ({ setShowList, url }: ICircleList) => {
  const [circles, setCircles] = useState<string[]>([]);
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

  return (
    <div className="p-5 px-4">
      <div className="text-xl font-bold mb-4">Circles on this page</div>
      {isLoading && (
        <div className="absolute left-1/2 -translate-x-1/2 transform self-center border-black py-4 ">
          <Loading />
        </div>
      )}

      <div className="space-y-2">
        {circles.map((item, index) => (
          <div
            key={index}
            className="circles-item p-4 rounded-md bg-gray-100 shadow-md transition-transform transform hover:scale-105"
          >
            <p className="circles-item-text text-sm text-gray-700">{item}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end my-4">
        <button
          onClick={() => setShowList(false)}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Add New
        </button>
      </div>
    </div>
  );
};

export default CirclList;
