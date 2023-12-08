import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import FormLine from "../../../../components/FormLine";
import { addCirclePageStatus, circlePageStatus } from "../../../../utils/constants";
import { Button } from "../../../../components/GeneralButton";

interface CircleFormData {
  name: string;
  description: string;
}

interface AddManualCircleInterface {
  setPageStatus: Dispatch<SetStateAction<number>>;
  setAddPageStatus: Dispatch<SetStateAction<number>>;
  url: string;
}

export const AddManualCircle = ({ setPageStatus, setAddPageStatus, url }: AddManualCircleInterface) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CircleFormData>();

  const handleCreateCircle = useCallback(
    (data: CircleFormData) => {
      setIsSaving(true);
      const { name, description } = data;
      chrome.runtime.sendMessage(
        {
          action: "createCircle",
          circleName: name,
          circleDescription: description,
          url,
        },
        (response) => {
          if (response.error) {
            console.log(
              "CirclesView: createCircle response.error: ",
              response.error
            );
            setIsSaving(false);
          } else {
            console.log("CirclesView: createCircle response: ", response);
            setIsSaving(false);
            setPageStatus(circlePageStatus.CIRCLE_LIST);
            // now we want to load circles again just to make sure the result went through
          }
        }
      );
    },
    [url, setPageStatus]
  );

  return (
    <div className="w-full h-full py-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-semibold">Create a new circle</p>
        <button
          onClick={() => setAddPageStatus(addCirclePageStatus.SELECT_OPTION)}
          className="bg-gray-500 text-white px-3 py-1 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit(handleCreateCircle)}
        className="space-y-6 w-full"
      >
        <FormLine
          title="Name:"
          id="name"
          type="text"
          error={errors.name?.message}
          {...register("name")}
          placeholder="Add circle name"
          required
        />
        <FormLine
          title="Description:"
          id="description"
          type="text"
          error={errors.description?.message}
          {...register("description")}
          placeholder="Add circle description"
          required
        />

        <div className="flex justify-center w-full pt-10">
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Adding" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddManualCircle;