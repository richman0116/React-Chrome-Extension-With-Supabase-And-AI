import {
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  Dispatch,
} from "react";

interface ICircleList {
  setShowList: Dispatch<SetStateAction<boolean>>;
  url: string;
}

const CirclList = ({ setShowList, url }: ICircleList) => {
  const [circles, setCircles] = useState<string[]>([]);

  const getCircles = useCallback(async () => {
    console.log("CirclesView: get url result: ", url);
    if (url !== "") {
      chrome.runtime.sendMessage({ action: "getCircles", url }, (response) => {
        if (response.error) {
          console.log(
            "CirclesView: getCircles response.error: ",
            response.error
          );
          setCircles([]);
        } else {
          console.log("CirclesView: getCircles response: ", response);
          if (response.data) {
            setCircles(response.data);
          } else {
            setCircles([]);
          }
        }
      });
    }
  }, [url]);

  useEffect(() => {
    getCircles();
  }, [getCircles]);

  return (
    <div className="pt-5 px-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowList(false)}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Add New
        </button>
      </div>

      <div className="text-xl font-bold mb-4">Circles on this page</div>

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
    </div>
  );
};

export default CirclList;
