import { Eye } from "lucide-react";

export const useHrPayrollTableDataHook = ({
  setToggleUi,
  setSinglePayroll,
}) => {
  const handleSetSinglePayroll = (payroll) => {
    setSinglePayroll(payroll);
    setToggleUi("payroll-details");
  };

  const columns = [
    {
      name: "Employee Name",
      width: "20%",
      render: (row) => (
        <div className="w-full flex items-center gap-1">
          <span className="w-[45px] h-[45px] rounded-full bg-gray-500"></span>
          <div className="w-[80%] flex flex-col ">
            <span className="text-sm font-sans font-semibold">
              {row?.user?.name}
            </span>
            <span>{row?.user?.email?.split("@")?.[0]}</span>
          </div>
        </div>
      ),
    },
    {
      name: "Employee ID",
      width: "10%",
      render: (row) => <p>{row?.user?.empId}</p>,
    },
    {
      name: "Job Title",
      width: "10%",
      render: (row) => <p>{row?.user?.jobTimeline?.[0]?.jobTitle}</p>,
    },
    {
      name: "Base Salary",
      width: "10%",
      render: (row) => <p>{row?.basicSalary}</p>,
    },
    {
      name: "Bonus",
      width: "10%",
      render: (row) => <p>{row?.advanceStatutoryBonus}</p>,
    },
    {
      name: "Deductions",
      width: "10%",
      render: (row) => <p>{row?.totalDeductions}</p>,
    },
    {
      name: "Status",
      width: "10%",
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
      name: "Net Pay",
      width: "10%",
      render: (row) => <p>{row?.netPay}</p>,
    },
    {
      name: "Action",
      width: "10%",
      render: (row) => (
        <button onClick={() => handleSetSinglePayroll(row)}>
          <Eye />
        </button>
      ),
    },
  ];

  return { columns };
};
