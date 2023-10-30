import classNames from "classnames";

const Loading = ({ className }: { className?: string }) => {
  return (
    <div
      className={classNames(
        "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black/90 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:border-white/90",
        className
      )}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default Loading;
