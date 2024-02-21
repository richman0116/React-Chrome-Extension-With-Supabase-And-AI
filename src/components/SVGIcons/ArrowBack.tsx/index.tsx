interface ArrowBackInterface {
  className?: string
}

const ArrowBack = ({ className }: ArrowBackInterface) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5892 4.75462C10.9146 4.42918 10.9146 3.90155 10.5892 3.57611C10.2637 3.25067 9.7361 3.25067 9.41066 3.57611L3.57733 9.40944C3.25189 9.73488 3.25189 10.2625 3.57733 10.588L9.41066 16.4213C9.7361 16.7467 10.2637 16.7467 10.5892 16.4213C10.9146 16.0958 10.9146 15.5682 10.5892 15.2428L6.17843 10.832H15.8333C16.2935 10.832 16.6666 10.4589 16.6666 9.9987C16.6666 9.53846 16.2935 9.16536 15.8333 9.16536H6.17843L10.5892 4.75462Z"
      fill="black"
      fillOpacity="0.9"
    />
  </svg>
)

export default ArrowBack
