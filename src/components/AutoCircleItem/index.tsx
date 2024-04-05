import { CircleInterface } from '../../types/circle'
import RoundedButton from '../Buttons/RoundedButton'

interface AutoCircleItemInterface {
  circle: CircleInterface
  url: string
  onAdd: () => void
}

const AutoCircleItem = ({ circle, onAdd }: AutoCircleItemInterface) => {
  return (
    <div className="p-4 transition-transform transform border border-stroke hover:bg-gray-100 flex gap-4 items-center rounded-2xl group">
      <img
        src="../duck.jpg"
        alt="circle logo"
        className=" rounded-full min-w-[48px] h-12"
      />
      <div className="w-full flex items-center">
        <div className="relative">
          <div className="flex flex-col justify-between gap-1 group-hover:text-gray-900 w-full">
            <p
              className="text-base font-bold text-primary line-clamp-1"
              title={circle.name}
            >
              {circle.name}
            </p>
            <p
              className="text-ellipsis line-clamp-2 text-sm font-medium text-tertiary"
              title={circle.description}
            >
              {circle.description}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden group-hover:block">
        <RoundedButton onClick={onAdd}>Add</RoundedButton>
      </div>
    </div>
  )
}

export default AutoCircleItem
