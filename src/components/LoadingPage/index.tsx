import EdenLogo from "../SVGIcons/EdenLogo"

const LoadingPage = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex animate-pulse items-center">
      <EdenLogo />
    </div>
  </div>
)

export default LoadingPage
