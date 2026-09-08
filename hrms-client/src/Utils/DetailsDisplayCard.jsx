import React from "react";

const DetailsDisplayCard = ({ left, right }) => {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="w-[50%] text-[14px] font-normal text-[#808080] overflow-hidden">
        {left}
      </div>
      <div className="w-[50%] text-[14px] font-semibold text-[#000000] overflow-hidden">
        {right}
      </div>
    </div>
  );
};

export default DetailsDisplayCard;
