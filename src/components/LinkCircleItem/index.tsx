import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { CircleInterface } from "../../types/circle";
import RoundedButton from "../Buttons/RoundedButton";
import { useCircleContext } from "../../context/CircleContext";

interface ILinkCircleItem {
  circle: CircleInterface;
  url: string;
}

const LinkCircleItem = ({ circle, url }: ILinkCircleItem) => {
  const [isLinking, setIsLinking] = useState<boolean>(false);

  const { getCircles } = useCircleContext();

  const handleClaim = useCallback(
    (circleId: string) => {
      setIsLinking(true);
      chrome.runtime.sendMessage(
        { action: "claimCircle", circleId, url },
        (response) => {
          if (response) {
            getCircles();
          }
          setIsLinking(false);
        }
      );
    },
    [getCircles, url]
  );

  return (
    <a
      href={`https://0xeden.com/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="p-3 transition-transform transform hover:cursor-pointer border border-stroke hover:bg-gray-100 flex gap-3 items-center rounded-2xl group hover:justify-between"
    >
      <img
        src={circle.circle_logo_image || `../duck.jpg`}
        alt="circle logo"
        className=" rounded-full min-w-[40px] h-10"
      />
      <p className="text-ellipsis line-clamp-2 group-hover:hidden text-xs font-medium text-primary">
        {circle.name}
      </p>

      <div className="hidden group-hover:block">
        <RoundedButton
          disabled={isLinking}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClaim(circle.id);
          }}
        >
          {isLinking ? "Linking" : "Link"}
        </RoundedButton>
      </div>
    </a>
  );
};

export default LinkCircleItem;
