import { Eye } from "lucide-react";
import { setSingleEmployee } from "../Slices/HrEmployeeSlice";
import { useDispatch } from "react-redux";

export const useHrEmployeeManagentScreenDataHook = ({ setToggleUi }) => {
  const dispatch = useDispatch();
  const handleSelectEmp = (emp) => {
    setToggleUi(false);
    dispatch(setSingleEmployee(emp));
  };

  const columns = [
    {
      name: "Employee Name",
      width: "20%",
      render: (row) => (
        <div className="w-full flex items-center gap-1 overflow-hidden">
          <span className="w-[45px] h-[45px] rounded-full bg-gray-500"></span>
          <div className="w-[75%] flex flex-col">
            <span className="text-base font-sans font-semibold">
              {row?.name}
            </span>
            <span className="-mt-1 text-[11px]">{row?.email}</span>
          </div>
        </div>
      ),
    },
    {
      name: "Employee ID",
      width: "10%",
      render: (row) => <p>{row.empId}</p>,
    },
    {
      name: "Job Title",
      width: "20%",
      render: (row) => <p>{row?.jobTimeline?.[0]?.jobTitle ?? "-"}</p>,
    },
    {
      name: "Department",
      width: "20%",
      render: (row) => <p>{row?.jobTimeline?.[0]?.positionType ?? "-"}</p>,
    },
    {
      name: "Shift Timings",
      width: "10%",
      render: (row) => (
        <p>
          {row?.jobTimeline?.[0]?.shiftTimmings?.startTime} {"-"}
          {row?.jobTimeline?.[0]?.shiftTimmings?.endTime}
        </p>
      ),
    },
    {
      name: "Status",
      width: "10%",
      render: (row) => (
        <div
          className={`px-3 py-1 rounded-sm w-fit ${
            row.status === "inactive" ? "bg-[#FFF4D2]" : "bg-[#ECFDF5]"
          } `}
        >
          <p
            className={`text-base font-semibold ${
              row.status === "inactive" ? "text-[#92400E]" : "text-[#064E3B]"
            }`}
          >
            {row?.status}
          </p>
        </div>
      ),
    },
    {
      name: "Action",
      width: "10%",
      render: (row) => (
        <button onClick={() => handleSelectEmp(row)}>
          <Eye />
        </button>
      ),
    },
  ];

  return { columns };
};
