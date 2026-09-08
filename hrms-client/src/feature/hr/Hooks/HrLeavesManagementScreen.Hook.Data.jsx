import { Eye } from "lucide-react";

export const useLeavesManagementScreenDataHook = ({
  setToggleUi,
  setSingleLeve,
}) => {
  const handleEyeIconClick = (lev) => {
    setToggleUi(false);
    setSingleLeve(lev);
  };

  const columns = [
    {
      name: "Employee Name",
      width: "20%",
      render: (row) => (
        <div className="w-full flex items-center gap-1">
          <span className="w-[45px] h-[45px] rounded-full bg-gray-500"></span>
          <div className="w-[80%] flex ">
            <span className="text-base font-sans font-semibold">
              {row?.user?.name}
            </span>
            <span>{row?.user?.email}</span>
          </div>
        </div>
      ),
    },
    {
      name: "Employee ID",
      width: "10%",
      render: (row) => <p>{row?.empId}</p>,
    },
    {
      name: "Leave Type",
      width: "10%",
      render: (row) => <p>{row.leaveType}</p>,
    },
    {
      name: "Document",
      width: "15%",
      render: (row) => <p>{row.document?.slice(0, 10)}</p>,
    },
    {
      name: "Duration",
      width: "20%",
      render: (row) => (
        <p>
          {row.startDate} - {row?.endDate}
        </p>
      ),
    },
    {
      name: "Status",
      width: "15%",
      render: (row) => (
        <div
          className={`px-3 py-1 rounded-sm w-fit ${
            row.status === "pending"
              ? "bg-[#FFF4D2]"
              : row.status === "approved"
              ? "bg-[#ECFDF5]"
              : "bg-[#FEE2E2]"
          } `}
        >
          <p
            className={`text-base font-semibold ${
              row.status === "pending"
                ? "text-[#92400E]"
                : row.status === "approved"
                ? "text-[#064E3B]"
                : "text-[#DC2626]"
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
        <button onClick={() => handleEyeIconClick(row)}>
          <Eye />
        </button>
      ),
    },
  ];

  return { columns };
};
