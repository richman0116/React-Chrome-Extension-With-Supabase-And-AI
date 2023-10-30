import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import FormLine from "../../../components/FormLine";

interface CircleFormData {
  name: string;
  description: string;
}

interface IAddNewCircle {
  setShowList: Dispatch<SetStateAction<boolean>>;
  url: string;
}

export const AddNewCircle = ({ setShowList, url }: IAddNewCircle) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CircleFormData>();

  const handleCreateCircle = useCallback(
    (data: CircleFormData) => {
      const { name } = data;
      chrome.runtime.sendMessage(
        { action: "createCircle", circleName: name, url: url },
        (response) => {
          if (response.error) {
            console.log(
              "CirclesView: createCircle response.error: ",
              response.error
            );
          } else {
            console.log("CirclesView: createCircle response: ", response);
            // now we want to load circles again just to make sure the result went through
          }
        }
      );
      setIsSaving(false);
    },
    [url]
  );

  return (
    <div className="w-full p-5 bg-gray-100 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-semibold">Create a new circle</p>
        <button
          onClick={() => setShowList(true)}
          className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
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

        <div className="flex justify-center">
          <button
            type="submit"
            className="p-2 px-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
          >
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewCircle;
