import { CircleInterface } from "../../types/circle";

interface CircleItemInterface {
  circle: CircleInterface;
}

const CircleItem = ({ circle }: CircleItemInterface) => {
  return (
    <div className="circles-item px-4 py-2 transition-transform transform hover:scale-105 hover:cursor-pointer flex gap-5 items-center">
      <div className="rounded-full w-20 h-20 bg-gray-400" />
      <div className="flex flex-col gap-2">
        <p className="circles-item-text text-sm text-gray-700">{circle.name}</p>
        <p className="circles-item-text text-sm text-gray-700">
          {circle.description}
        </p>
      </div>
    </div>
  );
};

export default CircleItem;
