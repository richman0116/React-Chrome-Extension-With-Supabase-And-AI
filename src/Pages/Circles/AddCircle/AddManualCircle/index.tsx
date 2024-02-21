import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";

import FormLine from "../../../../components/FormLine";
import { addCirclePageStatus, circlePageStatus } from "../../../../utils/constants";
import LargeButton from "../../../../components/Buttons/LargeButton";
import { TagInterface } from "../../../../types/tag";

interface CircleFormData {
  name: string;
  description: string;
}

interface AddManualCircleInterface {
  setPageStatus: Dispatch<SetStateAction<number>>;
  setAddPageStatus: Dispatch<SetStateAction<number>>;
  url: string;
}

export interface TagOptionInterface {
  value: string
  label: string
}

export const AddManualCircle = ({ setPageStatus, setAddPageStatus, url }: AddManualCircleInterface) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<TagOptionInterface[]>([])
  const [selectedTags, setSelectedTags] = useState<TagOptionInterface[]>([])


  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CircleFormData>();

  useEffect(() => {
    chrome.runtime.sendMessage(
      {
        action: "getTags",
      },
      (response) => {
        if (response.error) {
          console.log(
            "Get Tags: get tags response.error: ",
            response.error
          );
        } else {
          const generatedOptions = response.data?.map((tagItem: TagInterface) => ({ label: tagItem.tag_name, value: tagItem.id }))
          setTagOptions(generatedOptions)
        }
      }
    );
  }, [])

  const handleTagChange = useCallback((newTags: MultiValue<TagOptionInterface>) => {
    if (newTags) {
      setSelectedTags([...newTags])
      
    }
  }, [])

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
          tags: selectedTags.map((tag) => tag.value),
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
    [url, selectedTags, setPageStatus]
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
        {/* <div className="flex flex-col gap-y-1">
          <span className="text-black/60 text-sm font-semibold leading-4">Select Tags here</span>
          <Select
            onChange={(value) => handleTagChange(value)}
            options={tagOptions}
            className=" text-black/90 bg-black/5"
            isMulti
          />
        </div> */}

        <div className="flex justify-center w-full pt-10">
          <LargeButton
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Adding" : "Add"}
          </LargeButton>
        </div>
      </form>
    </div>
  );
};

export default AddManualCircle;
