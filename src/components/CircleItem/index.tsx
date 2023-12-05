import { useCallback, useEffect, useState } from "react";
import { CircleInterface } from "../../types/circle";

interface CircleItemInterface {
  circle: CircleInterface;
}

const CircleItem = ({ circle }: CircleItemInterface) => {
  const [isJoined, setIsJoined] = useState<boolean>(false)

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

  return (
    <a
      href={`https://edenzero.vercel.app/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="circles-item px-4 py-2 h-20 transition-transform transform hover:cursor-pointer hover:bg-slate-50 flex gap-5 items-center rounded-lg"
    >
      <div className="rounded-full min-w-[64px] h-16 bg-gray-300" />
      <div className="flex flex-col justify-between gap-2 text-sm text-gray-700 group-hover:text-gray-900 w-full">
        <div className="flex justify-between items-center w-full">
          <p className="font-semibold">{circle.name}</p>
          <p className="italic">{isJoined ? "Joined": ""}</p>
        </div>
        <p className="text-ellipsis line-clamp-2">{circle.description}</p>
      </div>
    </a>
  );
};

export default CircleItem;
