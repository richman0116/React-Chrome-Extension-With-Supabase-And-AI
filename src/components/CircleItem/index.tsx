import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

import { CircleInterface } from "../../types/circle";
import RoundedButton from "../Buttons/RoundedButton";

interface CircleItemInterface {
  circle: CircleInterface;
  url: string;
  isOnClaimPage?: boolean;
  setPageStatus?: Dispatch<SetStateAction<number>>;
}

const CircleItem = ({
  circle,
  isOnClaimPage,
  setPageStatus,
  url,
}: CircleItemInterface) => {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  const checkIfJoined = useCallback(async () => {
    chrome.runtime.sendMessage(
      { action: "checkIfUserJoinedCircle", circleId: circle.id },
      (response) => {
        if (response) {
          setIsJoined(response);
        }
      }
    );
  }, [circle.id]);

  useEffect(() => {
    checkIfJoined();
  }, [checkIfJoined]);

  const handleJoin = useCallback(
    (circleId: string) => {
      setIsJoining(true);
      chrome.runtime.sendMessage(
        { action: "joinCircle", circleId, url },
        (response) => {
          if (response === true) {
            checkIfJoined();
          }
          setIsJoining(false);
        }
      );
    },
    [checkIfJoined, url]
  );

  return (
    <a
      href={`https://0xeden.com/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="p-4 transition-transform transform hover:cursor-pointer border border-stroke hover:bg-gray-100 flex gap-4 items-center rounded-2xl group"
    >
      <img
        src={circle.circle_logo_image || `../duck.jpg`}
        alt="circle logo"
        className=" rounded-full min-w-[48px] h-12"
      />
      <div className="w-full flex items-center">
        <div className="flex flex-col justify-between gap-1 group-hover:text-gray-900 w-full">
          <div className="flex justify-between items-center w-full">
            <p className="text-base font-bold text-primary">{circle.name}</p>
            {isOnClaimPage ? null : (
              <p className="italic">{isJoined ? "Joined" : ""}</p>
            )}
          </div>
          <p
            className="text-ellipsis line-clamp-2 text-sm font-medium text-tertiary"
            title={circle.description}
          >
            {circle.description}
          </p>
        </div>
      </div>

      {!isJoined ? (
        <div className="hidden group-hover:block">
          <RoundedButton
            disabled={isJoining}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleJoin(circle.id);
            }}
          >
            {isJoining ? "Joining" : "Join"}
          </RoundedButton>
        </div>
      ) : null}
    </a>
  );
};

export default CircleItem;
