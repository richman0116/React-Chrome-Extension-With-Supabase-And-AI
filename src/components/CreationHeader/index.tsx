import Chevron from '../SVGIcons/Chevron'

interface ICreationHeader {
  title: string
  onBack: () => void
}

const CreationHeader = ({ title, onBack }: ICreationHeader) => (
  <div className="w-full flex gap-2 items-center sticky top-0 bg-white py-3 z-40">
    <div className="text-primary cursor-pointer" onClick={onBack}>
      <Chevron width="24" height="24" color="#131719" viewBox="0 0 24 24" />
    </div>
    <p className="text-2xl font-medium capitalize text-primary">{title}</p>
  </div>
)

export default CreationHeader
