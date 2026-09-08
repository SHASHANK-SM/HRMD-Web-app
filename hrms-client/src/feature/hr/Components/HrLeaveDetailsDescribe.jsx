import { Pin, X } from "lucide-react";
import IconButton from "../../../Utils/IconButon";
import InputValueBind from "../../../Utils/InputValueBind";
import { leaveStatusChange } from "../Services/hr-leaves-management";
import { useState } from "react";

const HrLeaveDetailsDescribe = ({ singleLeave, setToggleUi, fetchLeaves }) => {
  const token = localStorage.getItem("token");
  const [hrNote, setHrNote] = useState("");

  const handlesubmiteLeaveStatus = async (status) => {
    console.log("hrNote", hrNote);

    const data = await leaveStatusChange({
      status,
      token,
      id: singleLeave?._id,
      hrNote,
    });
    if (data?.status) {
      setToggleUi(true);
      fetchLeaves({ page: 1 });
    }
  };

  return (
    <div className="w-[75%] bg-white p-5 rounded-md flex flex-col gap-4">
      <div className="w-full border border-borderColor p-4 rounded-md flex flex-col gap-4">
        <h2 className="text-sm font-semibold font-sans self-end">
          Applied Date Here:12 June 2026
        </h2>
        <div className="flex flex-wrap gap-4 items-start justify-between">
          <InputValueBind
            label="Leave Type (Subject)"
            value={singleLeave?.leaveType}
          />
          <InputValueBind
            label="Number Of Days"
            value={singleLeave?.numberOfDays}
          />
          <InputValueBind label="Start Date" value={singleLeave?.startDate} />
          <InputValueBind
            label="Related Docs"
            value={singleLeave?.document}
            isDisplayEye={true}
          />
          <InputValueBind label="End Date" value={singleLeave?.endDate} />
        </div>
      </div>
      <textarea
        rows={6}
        className={`w-full border rounded-md px-2 py-2 resize-none outline-none`}
        value={singleLeave?.reason}
      />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-sans font-semibold">Hr/Manager Note</span>
        <textarea
          rows={2}
          value={hrNote}
          onChange={(e) => setHrNote(e.target.value)}
          className={`w-full border rounded-md px-2 py-2 resize-none outline-none`}
        />
      </div>
      <div className="w-full flex justify-end items-end">
        <div className="flex items-center gap-4">
          <IconButton
            icon={<X size={16} />}
            text="Reject"
            bgColor="#FEE2E2"
            textColor="#FF0000"
            onClick={() => handlesubmiteLeaveStatus("rejected")}
          />
          <IconButton
            icon={<Pin size={16} />}
            text="Approved"
            bgColor="#D1FAE5"
            textColor="#059669"
            onClick={() => handlesubmiteLeaveStatus("approved")}
          />
        </div>
      </div>
    </div>
  );
};

export default HrLeaveDetailsDescribe;
