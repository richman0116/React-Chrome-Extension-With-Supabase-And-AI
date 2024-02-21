import { useCallback, useEffect, useMemo, useState } from "react";

import CirclList from "./CirclesList";
import Header from "../../components/Header";
import MyCircles from "./MyCircles";
import RecommendedCircles from "./RecommendedCircles";
import { useCircleContext } from "../../context/CircleContext";

const Circles = () => {
  const { isLoading, circles } = useCircleContext();

  const resultText = useMemo(() => {
    if (!isLoading) {
      if (circles.length > 1) {
        return `${circles.length} circles on this page`;
      } else {
        return `${circles.length} circle on this page`;
      }
    }
  }, [circles, isLoading]);

  return (
    <div className="w-full h-full flex flex-col gap-5 overflow-y-auto overflow-x-hidden scrollbar-none">
      <Header />
      <div className="w-full sticky top-0 bg-white py-3 z-50">
        <p className=" text-3.5xl font-medium capitalize text-primary">
          {resultText}
        </p>
      </div>
      <CirclList />
      <RecommendedCircles />
      <MyCircles />
    </div>
  );
};

export default Circles;
