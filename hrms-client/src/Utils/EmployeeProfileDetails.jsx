import { ArrowRight, Mail, Workflow } from "lucide-react";
import React from "react";
import Select from "./Select";
import { useSelector } from "react-redux";

const EmployeeProfileDetails = ({ setToggleUi }) => {
  const { singleEmployee } = useSelector((state) => state.employeeList);

  return (
    <div className="w-[25%] bg-white rounded-md p-4 flex flex-col items-center py-10">
      <div className="flex flex-col gap-1 justify-center items-center border-b border-b-gray-400 pb-4 w-full">
        <span
          onClick={() => setToggleUi(true)}
          className="flex self-start text-base font-sans font-semibold items-center"
        >
          <ArrowRight size={20} />
          Back
        </span>
        <span className="w-[80px] h-[80px] bg-gray-400 rounded-full"></span>
        <h2 className="text-lg font-bold font-sans ">{singleEmployee?.name}</h2>
        <span className="text-base font-normal ">{singleEmployee?.empId}</span>
        <span className="px-4 py-1 rounded-md bg-red-200 text-white">
          {singleEmployee?.status}
        </span>
      </div>
      <div className="border-b border-b-gray-400 pb-4 w-full flex flex-col gap-1 py-4 overflow-hidden">
        <div className="w-full flex items-center gap-4">
          <Workflow size={20} color="gray" />
          <span className="text-base font-semibold">
            {singleEmployee?.designation}
          </span>
        </div>
        <div className="w-full flex items-center gap-4">
          <Mail size={20} color="gray" />
          <span className="text-base font-semibold">
            {singleEmployee?.email}
          </span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 py-4">
        <div>
          <span className="text-sm font-sans font-semibold text-[#C4C4C4]">
            Department
          </span>
          <h3 className="text-lg font-sans font-semibold">Designer</h3>
        </div>
        <div>
          <span className="text-sm font-sans font-semibold text-[#C4C4C4]">
            Employee ID
          </span>
          <h3 className="text-lg font-sans font-semibold">
            {singleEmployee?.empId}
          </h3>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="w-[50px] h-[50px] bg-gray-400 rounded-full"></span>
          <div className="flex flex-col gap-0">
            <span className="text-sm font-sans font-semibold text-[#C4C4C4]">
              Line Manager
            </span>
            <h3 className="text-lg font-sans font-semibold">Manager Name</h3>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center items-center">
        <Select
          options={[
            { label: "Active", value: "active" },
            { label: "In-Active", value: "inactive" },
          ]}
          name="status"
          firstOption="All Status"
          //   onChange={(e) => setStatus(e.target.value)}
          //   value={status}
          width="w-[160px]"
          //   bgColor="black"
        />
      </div>
    </div>
  );
};

export default EmployeeProfileDetails;
