import React from "react";
import { useLeaveManagementCountHook } from "../Hooks/LeavesManagentCountData.Hook";

const HrLeavesCardCount = () => {
  const cards = useLeaveManagementCountHook();
  return (
    <div className="w-full flex flex-wrap gap-4 justify-between items-center">
      {cards.map((item, index) => (
        <LeaveStatCard key={index} item={item} />
      ))}
    </div>
  );
};

export default HrLeavesCardCount;

export const LeaveStatCard = ({ item }) => {
  return (
    <div className="w-[260px] p-4 rounded-md bg-white shadow-custom flex flex-col gap-2">
      <h3 className="text-base font-sans font-semibold text-black">
        {item.title}
      </h3>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-0">
          <h2 className="font-sans font-bold text-3xl">{item.count}</h2>
          <span className="text-[10px] font-normal">{item.subText}</span>
        </div>

        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center ${item.iconBg}`}
        >
          {item.icon}
        </div>
      </div>
    </div>
  );
};
