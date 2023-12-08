import { Dispatch, SetStateAction, useState } from "react";
import AddManualCircle from "./AddManualCircle";
import { addCirclePageStatus, circlePageStatus } from "../../../utils/constants";
import AddGeneratedCircles from "./AddGeneratedCircles";
import { Button } from "../../../components/GeneralButton";

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
            <Button
              onClick={() => setAddPageStatus(addCirclePageStatus.ADD_AUTOMATICALLY)}
            >
              Choose From Auto-generated Circles
            </Button>
            <Button
              onClick={() => setAddPageStatus(addCirclePageStatus.ADD_MANUALLY)}
            >
              Add Manually
            </Button>
          </div>
        </div>
      )}
      {addPageStatus === addCirclePageStatus.ADD_AUTOMATICALLY && <AddGeneratedCircles setPageStatus={setPageStatus} setAddPageStatus={setAddPageStatus} url={url} />}
      {addPageStatus === addCirclePageStatus.ADD_MANUALLY && <AddManualCircle setPageStatus={setPageStatus} setAddPageStatus={setAddPageStatus} url={url} />}
    </>
  )
};

export default AddNewCircle;
