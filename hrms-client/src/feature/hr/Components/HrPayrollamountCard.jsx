import { useHrPayrollCountHook } from "../Hooks/HrPayrollCountData";
import { LeaveStatCard } from "./HrLeavesCardCount";

const HrPayrollamountCard = () => {
  const payrollCount = useHrPayrollCountHook();
  return (
    <div className="w-full flex flex-wrap gap-4 justify-between items-center">
      {payrollCount.map((item, index) => (
        <LeaveStatCard key={index} item={item} />
      ))}
    </div>
  );
};

export default HrPayrollamountCard;
