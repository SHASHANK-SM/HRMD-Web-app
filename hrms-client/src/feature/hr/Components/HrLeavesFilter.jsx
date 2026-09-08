import React from "react";
import Select from "../../../Utils/Select";
import { leaveTypes } from "../../employee/Modal/ApplyLeavesModal";
import IconButton from "../../../Utils/IconButon";
import { LogOut, MoveRightIcon } from "lucide-react";
const leavesStatus = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const HrLeavesFilter = ({ setStatus, setLeaveType, status, leaveType }) => {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Select
          name="leaveType"
          options={[{ label: "All", value: "all" }, ...leaveTypes]}
          firstOption="Leave Type"
          onChange={(e) => setLeaveType(e.target.value)}
          value={leaveType}
          width="w-[300px]"
        />
        <Select
          name="status"
          options={[{ label: "All", value: "all" }, ...leavesStatus]}
          firstOption="All Status"
          onChange={(e) => setStatus(e.target.value)}
          value={status}
          width="w-[200px]"
        />
      </div>
      <div className="flex items-center gap-4">
        <IconButton
          icon={<LogOut size={16} />}
          text="Export"
          //   onClick={() => setOpenAddEmpModal(true)}
          //   bgColor="black"
          //   textColor="#fff"
        />
        <IconButton
          icon={<MoveRightIcon size={16} />}
          text="Approve Selected"
          //   onClick={() => setOpenAddEmpModal(true)}
          bgColor="#059669"
          textColor="#fff"
        />
      </div>
    </div>
  );
};

export default HrLeavesFilter;
