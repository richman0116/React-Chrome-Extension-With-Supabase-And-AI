import { CircleInterface } from "../../types/circle";

interface CircleItemInterface {
  circle: CircleInterface;
}

const CircleItem = ({ circle }: CircleItemInterface) => {
  return (
    <a
      href={`https://edenzero.vercel.app/circle/${circle.id}`}
      rel="noreferrer"
      target="_blank"
      className="circles-item px-4 my-2 h-20 transition-transform transform hover:cursor-pointer flex gap-5 items-center group"
    >
      <div className="rounded-full min-w-[80px] h-20 bg-gray-300 group-hover:bg-gray-400" />
      <div className="flex flex-col justify-between gap-2 text-sm text-gray-700 group-hover:text-gray-900">
        <p className="font-semibold">{circle.name}</p>
        <p className="text-ellipsis line-clamp-2">{circle.description}</p>
      </div>
    </a>
  );
};

export default CircleItem;
