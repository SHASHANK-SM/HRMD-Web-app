import { Home, Clock, CalendarCheck, AlertTriangle, UserX } from "lucide-react";

export const useLeaveManagementCountHook = () => {
  return [
    {
      title: "Total Leave Request",
      count: "49",
      subText: "This Month",
      icon: <Home className="text-black" />,
      iconBg: "bg-[#DBEAFE]",
    },
    {
      title: "Pending Approvals",
      count: "12",
      subText: "Awaiting Review",
      icon: <Clock className="text-black" />,
      iconBg: "bg-[#FEF3C7]",
    },
    {
      title: "On Leave Today",
      count: "3",
      subText: "Today",
      icon: <CalendarCheck className="text-black" />,
      iconBg: "bg-[#D1FAE5]",
    },
    {
      title: "Leaves Balance Alert",
      count: "7",
      subText: "Below 5 Days",
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
