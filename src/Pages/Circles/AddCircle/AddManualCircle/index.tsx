import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import FormLine from "../../../../components/FormLine";
import { useCircleContext } from "../../../../context/CircleContext";
import CreationHeader from "../../../../components/CreationHeader";
import Button from "../../../../components/Buttons/Button";
import GenerateButton from "../../../../components/Buttons/GenerateButton";
import Refresh from "../../../../components/SVGIcons/Refresh";
import Loading from "../../../../components/Loading";

import { resizeAndConvertImageToBuffer, uploadImageToSupabase } from "../../../../utils/helpers";
import { circlePageStatus } from "../../../../utils/constants";
import { generateCircleImage } from "../../../../utils/edgeFunctions";

import { CircleInterface } from "../../../../types/circle";
import { initialCircleData } from "..";

interface CircleFormData {
  name: string;
  description: string;
}

interface IAddManualCIrcle {
 circleData: CircleInterface
 setCircleData: Dispatch<SetStateAction<CircleInterface>>
}

export const AddManualCircle = ({ circleData, setCircleData }: IAddManualCIrcle) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [circleImageUrl, setCircleImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const { currentUrl: url, setPageStatus, getCircles } = useCircleContext();
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors },
  } = useForm<CircleFormData>({
    defaultValues: circleData
  });

  const { tags } = circleData

  const handleCreateCircle = useCallback(
    (data: CircleFormData) => {
      if (circleImageUrl) {
        setIsSaving(true);
        
        // add tags first
        chrome.runtime.sendMessage(
          {
            action: "addTags",
            names: tags
          },
          (addedTags: string[]) => {
            const { name, description } = data;
            chrome.runtime.sendMessage(
              {
                action: "createCircle",
                circleName: name,
                circleDescription: description,
                url,
                tags: addedTags,
              },
              async (response) => {
                if (response.error) {
                  console.log("CirclesView: createCircle response.error: ", response.error);
                  setIsSaving(false);
                } else {
                  const addedCircleId = response.data
                  console.log("Added circle id ", addedCircleId);

                  try {
                    // convert the OpenAI image to resized image buffer
                    const webpBuffer = await resizeAndConvertImageToBuffer(circleImageUrl)
  
                    // upload the converted image to Supabase storage
                    await uploadImageToSupabase(webpBuffer, "media_bucket", `circle_images/${addedCircleId}.webp`)
  
                    // update the circle's logo url
                    chrome.runtime.sendMessage(
                      {
                        action: 'updateCircleImageUrl',
                        circleId: addedCircleId
                      },
                      (res) => {
                        if (res === "success") {
                          getCircles()
                          setIsSaving(false);
                          setPageStatus(circlePageStatus.CIRCLE_LIST);
                          // now we want to load circles again just to make sure the result went through
                        } else {
                          setIsSaving(false)
                        }
                      }
                    )
  
                  } catch (ex) {
                    console.error(ex)
                    setIsSaving(false)
                  }
                }
              }
            );
          }
        )
      }
    },
    [circleImageUrl, url, tags, setPageStatus, getCircles]
  );

  const handleGenerateImage = useCallback(async () => {
    const name = getValues("name");
    const description = getValues("description");
    if (name && description) {
      setIsGeneratingImage(true);
      const result = await generateCircleImage(undefined, name, description);
      setCircleImageUrl(result.url.replaceAll('"', ''));
      setIsGeneratingImage(false);
    }
  }, [getValues]);

  return (
    <div className="w-full h-full py-5">
      <CreationHeader
        title="Create Circle"
        onBack={() => {
          setCircleData(initialCircleData)
          setPageStatus(circlePageStatus.ADD_AUTOMATICALLY)
        }
        }
      />
      <form
        onSubmit={handleSubmit(handleCreateCircle)}
        className="space-y-6 w-full flex flex-col items-center"
      >
        <FormLine
          title="Name:"
          id="name"
          type="text"
          error={errors.name?.message}
          {...register("name")}
          placeholder="Give it a good name!"
          required
        />
        <FormLine
          title="Description:"
          id="description"
          type="text"
          error={errors.description?.message}
          {...register("description")}
          placeholder="What does it about?"
          required
        />
        {isGeneratingImage ? (
          <Loading />
        ) : (
          <img
            src={circleImageUrl || "../duck.jpg"}
            alt="circle logo"
            className=" rounded-full min-w-[128px] h-32"
          />
        )}

        <div className="w-full flex justify-center">
          <GenerateButton type="button" onClick={handleGenerateImage}>
            <Refresh />
            <p>{isGeneratingImage ? "Generating" : "Generate"}</p>
          </GenerateButton>
        </div>

        <div className="fixed bottom-6 w-fit justify-center">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Completing" : "Complete"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddManualCircle;
