import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select, { MultiValue } from "react-select";

import FormLine from "../../../../components/FormLine";
import { TagInterface } from "../../../../types/tag";
import { useCircleContext } from "../../../../context/CircleContext";
import CreationHeader from "../../../../components/CreationHeader";
import Button from "../../../../components/Buttons/Button";
import { circlePageStatus } from "../../../../utils/constants";

interface CircleFormData {
  name: string;
  description: string;
}

export interface TagOptionInterface {
  value: string
  label: string
}

export const AddManualCircle = () => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [tagOptions, setTagOptions] = useState<TagOptionInterface[]>([])
  const [selectedTags, setSelectedTags] = useState<TagOptionInterface[]>([])

  const { currentUrl: url, setPageStatus } = useCircleContext()


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
      <CreationHeader title="Create Manually" onBack={() => setPageStatus(circlePageStatus.CIRCLE_LIST)} />
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
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Completing" : "Complete"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddManualCircle;
