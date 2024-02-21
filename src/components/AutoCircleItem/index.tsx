import { useCallback, useState } from "react";

import { CircleInterface } from "../../types/circle";
import { circlePageStatus } from "../../utils/constants";
import RoundedButton from "../Buttons/RoundedButton";
import { useCircleContext } from "../../context/CircleContext";

interface AutoCircleItemInterface {
  circle: CircleInterface;
  url: string;
}

const AutoCircleItem = ({
  circle,
  url,
}: AutoCircleItemInterface) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { name, description, tags } = circle;

  const { setPageStatus } = useCircleContext()

  const handleAdd = useCallback(() => {
    setIsAdding(true);
    chrome.runtime.sendMessage(
      {
        action: "addTags",
        names: tags,
      },
      (res) => {
        if (res.error) {
          console.log("An error occured while adding tags");
          setIsAdding(false);
        } else {
          chrome.runtime.sendMessage(
            {
              action: "createCircle",
              circleName: name,
              circleDescription: description,
              url,
              tags: res.data || [],
            },
            (response) => {
              if (response.error) {
                console.log(
                  "CirclesView: createCircle response.error: ",
                  response.error
                );
                setIsAdding(false);
              } else {
                console.log("CirclesView: createCircle response: ", response);
                setIsAdding(false);
                // now we want to load circles again just to make sure the result went through
                setPageStatus(circlePageStatus.CIRCLE_LIST)
              }
            }
          );
        }
      }
    );
  }, [description, name, setPageStatus, tags, url]);

  return (
    <div className="p-4 transition-transform transform hover:cursor-pointer border border-stroke hover:bg-gray-100 flex gap-4 items-center rounded-2xl group">
      <img
        src="../duck.jpg"
        alt="circle logo"
        className=" rounded-full min-w-[48px] h-12"
      />
      <div className="w-full flex items-center">
        <div className="relative">
          <div className="flex flex-col justify-between gap-1 group-hover:text-gray-900 w-full">
            <p className="text-xs font-bold text-primary">{circle.name}</p>
            <p className="text-ellipsis line-clamp-2 text-xs font-medium text-tertiary">
              {circle.description}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden group-hover:block">
        <RoundedButton
          disabled={isAdding}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAdd();
          }}
        >
          {isAdding ? "Adding" : "Add"}
        </RoundedButton>
      </div>
    </div>
  );
};

export default AutoCircleItem;
