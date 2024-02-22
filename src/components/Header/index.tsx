import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import CircleIcon from "../SVGIcons/CircleIcon";
import UserIcon from "../SVGIcons/UserIcon";
import Avatar from "../Avatar";

const Header = () => {
  const { isAuthenticated } = useAuthContext();
  const [usersCount, setUsersCount] = useState(0);
  const [circlesCount, setCirclesCount] = useState(0);
  

  useEffect(() => {
    (() => {
      chrome.runtime.sendMessage(
        {
          action: "getUniqueUsersCountInUserCircles",
        },
        (res: any) => {
          if (!res.error) {
            setUsersCount(res);
          }
        }
      );
    })();
  }, []);

  useEffect(() => {
    (() => {
      chrome.runtime.sendMessage(
        {
          action: "getUserCirclesCount",
        },
        (res: any) => {
          if (!res.error) {
            setCirclesCount(res);
          }
        }
      );
    })();
  }, []);

  return (
    <div className="w-full flex justify-between items-center">
      <p className="text-xl font-extrabold leading-normal text-brand">Eden</p>
      {isAuthenticated ? (
        <div className="px-3 py-2 bg-secondary flex items-center gap-2 rounded-3xl text-primary">
          <div className="flex gap-1 items-center justify-between">
            <CircleIcon />
            <p className="text-xs font-medium">{circlesCount}</p>
          </div>
          <div className="flex gap-1 items-center justify-between">
            <UserIcon />
            <p className="text-xs font-medium">{usersCount}</p>
          </div>
          <Avatar />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
