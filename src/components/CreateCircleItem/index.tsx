import Plus from "../SVGIcons/Plus"

const CreateCircleItem = () => {

  return (
    <button className="w-fit flex gap-x-2 items-center rounded-full px-3 py-4 bg-white cursor-pointer">
      <Plus />
      <p className="text-sm font-bold leading-normal text-primary">
        Create new Circle
      </p>
    </button>
  )
}

export default CreateCircleItem
