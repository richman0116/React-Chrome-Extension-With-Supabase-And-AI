import { Dispatch, SetStateAction, useCallback, useState } from "react";
import AddManualCircle from "./AddManualCircle";
import { addCirclePageStatus, circlePageStatus } from "../../../utils/constants";
import AddGeneratedCircles from "./AddGeneratedCircles";

interface IAddNewCircle {
  setPageStatus: Dispatch<SetStateAction<number>>;
  url: string;
}

export const AddNewCircle = ({ setPageStatus, url }: IAddNewCircle) => {
  const [addPageStatus, setAddPageStatus ] = useState<number>(addCirclePageStatus.SELECT_OPTION)
  return (
      <>
      {addPageStatus === addCirclePageStatus.SELECT_OPTION && (
        <div className="w-full h-full py-5 flex flex-col gap-10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-semibold">Choose an option</p>
            <button
              onClick={() => setPageStatus(circlePageStatus.CIRCLE_LIST)}
              className="bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Back
            </button>
          </div>
          <p className=" text-lg">You can add new circles manually or by choosing one of the auto-generated circles by ChatGPT</p>
          <div className="flex flex-col gap-10">
            <button
              onClick={() => setAddPageStatus(addCirclePageStatus.ADD_AUTOMATICALLY)}
              className="w-full p-5 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
            >
              Choose From Auto-generated Circles
            </button>
            <button
              onClick={() => setAddPageStatus(addCirclePageStatus.ADD_MANUALLY)}
              className="w-full p-5 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
            >
              Add Manually
            </button>
          </div>
        </div>
      )}
      {addPageStatus === addCirclePageStatus.ADD_AUTOMATICALLY && <AddGeneratedCircles />}
      {addPageStatus === addCirclePageStatus.ADD_MANUALLY && <AddManualCircle setPageStatus={setPageStatus} setAddPageStatus={setAddPageStatus} url={url} />}
    </>
  )
};

export default AddNewCircle;
