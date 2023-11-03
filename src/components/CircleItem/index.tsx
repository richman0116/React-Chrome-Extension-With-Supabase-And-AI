import { CircleInterface } from "../../types/circle";

interface CircleItemInterface {
  circle: CircleInterface;
}

const CircleItem = ({ circle }: CircleItemInterface) => {
  return (
    <div className="circles-item px-4 py-2 h-20 transition-transform transform hover:scale-105 hover:cursor-pointer flex gap-5 items-center group">
      <div className="rounded-full min-w-[80px] h-20 bg-gray-400" />
      <div className="flex flex-col h-full justify-between gap-2 text-sm group-hover:text-base text-gray-700 group-hover:text-gray-900">
        <p className="font-semibold">{circle.name}</p>
        <p className="text-ellipsis line-clamp-2">{circle.description}</p>
      </div>
    </div>
  );
};

export default CircleItem;
