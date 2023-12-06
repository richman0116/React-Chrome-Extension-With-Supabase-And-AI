import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import classNames from "classnames";

import { CircleInterface } from "../../types/circle";
import { circlePageStatus } from "../../utils/constants";

interface CircleItemInterface {
  circle: CircleInterface;
  url: string;
  isOnClaimPage?: boolean;
  setPageStatus?: Dispatch<SetStateAction<number>>
}

const CircleItem = ({ circle, isOnClaimPage, setPageStatus, url }: CircleItemInterface) => {
  const [isJoined, setIsJoined] = useState<boolean>(false)
  const [isClaiming, setIsClaiming] = useState<boolean>(false)

  const checkIfJoined = useCallback(async () => {
    chrome.runtime.sendMessage({ action: "checkIfUserJoinedCircle", circleId: circle.id }, (response) => {
      if (response) {
        setIsJoined(response);
      }
    });
  }, [circle.id]);

  useEffect(() => {
    checkIfJoined()
  }, [checkIfJoined]);

  const handleClaim = useCallback((circleId: string) => {
    setIsClaiming(true)
    chrome.runtime.sendMessage({ action: "claimCircle", circleId, url }, (response) => {
      setIsClaiming(false)
      if (response) {
        setPageStatus?.(circlePageStatus.CIRCLE_LIST)
      }
    });
  }, [setPageStatus, url])

  return (
    <a
      href={`https://edenzero.vercel.app/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="circles-item px-4 py-2 h-20 transition-transform transform hover:cursor-pointer hover:bg-slate-50 flex gap-5 items-center rounded-lg"
    >
      <div className="rounded-full min-w-[64px] h-16 bg-gray-300" />
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col justify-between gap-2 text-sm text-gray-700 group-hover:text-gray-900 w-full">
          <div className="flex justify-between items-center w-full">
            <p className="font-semibold">{circle.name}</p>
            { isOnClaimPage ? null :<p className="italic">{isJoined ? "Joined": ""}</p> }
          </div>
          <p className="text-ellipsis line-clamp-2">{circle.description}</p>
        </div>
        {isOnClaimPage && 
          <button
            disabled={isClaiming}
            onClick={(e) =>{
              e.stopPropagation()
              e.preventDefault()
              handleClaim?.(circle.id)
            }}
            className={classNames("px-4 py-2  focus:ring-opacity-50 text-white focus:outline-none focus:ring-2 rounded-full bg-blue-500  hover:bg-blue-600 active:bg-blue-700 focus:ring-blue-500", {
              ' bg-gray-500 hover:bg-gray-600 active:bg-gray-700 focus:ring-gray-500': isClaiming
            })}
          >
            {isClaiming ? 'Claiming': 'Claim'}
          </button>}
      </div>
    </a>
  );
};

export default CircleItem;
