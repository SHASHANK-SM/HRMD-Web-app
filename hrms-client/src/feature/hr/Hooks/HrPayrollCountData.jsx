import { Home, Clock, CalendarCheck, AlertTriangle, UserX } from "lucide-react";

export const useHrPayrollCountHook = () => {
  return [
    {
      title: "Total Payroll Expenses",
      count: "142,500",
      subText: "This Month",
      icon: <Home className="text-black" />,
      iconBg: "bg-[#DBEAFE]",
    },
    {
      title: "Pending Approvals",
      count: "2,500",
      subText: "Pending",
      icon: <Clock className="text-black" />,
      iconBg: "bg-[#FEF3C7]",
    },
    {
      title: "On Leave Today",
      count: "42,500",
      subText: "Upcoming",
      icon: <CalendarCheck className="text-black" />,
      iconBg: "bg-[#D1FAE5]",
    },
    {
      title: "Leaves Balance Alert",
      count: "142,",
      subText: "Paid",
      icon: <AlertTriangle className="text-black" />,
      iconBg: "bg-[#FEE2E2]",
    },
    // {
    //   title: "Leave Rejections",
    //   count: "5",
    //   subText: "This Month",
    //   icon: <UserX className="text-white" />,
    //   iconBg: "bg-gray-500",
    // },
  ];
};
