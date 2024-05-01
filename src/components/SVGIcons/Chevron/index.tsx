interface ChevronInterface {
  width: string,
  height: string,
  viewBox: string,
  color: string
}


const Chevron = ({ width, height, color, viewBox }: ChevronInterface) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox={viewBox} // Default to "0 0 24 24" if no viewBox is specified
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={viewBox === "0 0 16 16" ? 
         "M3.43427 5.8349C3.74669 5.52248 4.25322 5.52248 4.56564 5.8349L7.99995 9.26922L11.4343 5.8349C11.7467 5.52248 12.2532 5.52248 12.5656 5.8349C12.8781 6.14732 12.8781 6.65385 12.5656 6.96627L8.56564 10.9663C8.25322 11.2787 7.74669 11.2787 7.43427 10.9663L3.43427 6.96627C3.12185 6.65385 3.12185 6.14732 3.43427 5.8349Z" :
         "M15.8487 5.15128C16.3174 5.61991 16.3174 6.3797 15.8487 6.84833L10.6973 11.9998L15.8487 17.1513C16.3174 17.6199 16.3174 18.3797 15.8487 18.8483C15.3801 19.317 14.6203 19.317 14.1517 18.8483L8.15167 12.8483C7.68304 12.3797 7.68304 11.6199 8.15167 11.1513L14.1517 5.15128C14.6203 4.68265 15.3801 4.68265 15.8487 5.15128Z"
        }
      fill={color}
    />
  </svg>
);

export default Chevron;
