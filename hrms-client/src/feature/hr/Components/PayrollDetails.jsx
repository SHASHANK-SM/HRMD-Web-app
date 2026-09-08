import { ArrowLeft, Download, Mail } from "lucide-react";
import React from "react";
import IconButton from "../../../Utils/IconButon";

const PayrollDetails = ({ singlePayroll, setToggleUi }) => {
  const user = singlePayroll?.user;
  const details = [
    {
      label: "Date Of Joining",
      value: user?.jobTimeline?.[0]?.effectiveDate
        ? new Date(user.jobTimeline[0].effectiveDate).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )
        : "-",
    },
    { label: "PAN", value: user?.pan || "N/A" },
    { label: "Bank A/c", value: user?.bankAccount || "N/A" },
  ];

  const availableDate = [
    {
      label: "Available Calender Days",
      value: user?.jobTimeline?.[0]?.effectiveDate
        ? new Date(user.jobTimeline[0].effectiveDate).toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )
        : "-",
    },
    { label: "Paid Days", value: user?.pan || "N/A" },
    { label: "Loss Of Pay Days", value: user?.bankAccount || "N/A" },
  ];

  const eranings = [
    { label: "Basic Salary", value: singlePayroll?.basicSalary || "N/A" },
    {
      label: "House Rent Allowance",
      value: singlePayroll?.houseRentAllowance || "N/A",
    },
    {
      label: "Conveyance Allowance",
      value: singlePayroll?.conveyanceAllowance || "N/A",
    },

    {
      label: "Special Allowance",
      value: singlePayroll?.specialAllowance || "N/A",
    },
    {
      label: "Advance Statutory Bonus",
      value: singlePayroll?.advanceStatutoryBonus || "N/A",
    },
  ];

  const ppf = [
    { label: "Profession Tax", value: singlePayroll?.professionTax || "N/A" },
    {
      label: "Provident Fund (Employee)",
      value: singlePayroll?.providentFundEmployeeContribution || "N/A",
    },
    {
      label: "TDS",
      value: singlePayroll?.tds || "N/A",
    },
  ];

  const netPay = [
    { label: "Total Earnings", value: singlePayroll?.totalEarnings || "N/A" },
    {
      label: "Total Deductions",
      value: singlePayroll?.totalDeductions || "N/A",
    },
    {
      label: "Net Pay",
      value: singlePayroll?.netPay || "N/A",
    },
  ];

  return (
    <div className="w-full rounded-md p-4 bg-white flex flex-col gap-3">
      <div
        onClick={() => setToggleUi("table")}
        className="w-full flex items-center gap-4 cursor-pointer"
      >
        <ArrowLeft size={20} />
        <span>Payroll Details</span>
      </div>
      <div className="w-full border border-borderColor p-4 rounded-lg flex justify-between items-center">
        <div className="flex items-start gap-4">
          <span className="w-[60px] h-[60px] bg-gray-400 rounded-full"></span>
          <div className="flex gap-0 flex-col">
            <h3 className="text-base font-semibold font-sans">
              {singlePayroll?.user?.name}
            </h3>
            <span className="text-sm text-gray-700">
              {singlePayroll?.user?.email}
            </span>
            <span className="text-sm text-gray-700">
              Employee ID{" "}
              <span className="text-base font-semibold">
                {singlePayroll?.user?.empId}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-700">
            Location{" "}
            <span className="text-base font-semibold">
              {singlePayroll?.user?.jobTimeline?.[0]?.location}
            </span>
          </span>
          <span className="text-sm text-gray-700">
            Seat Number{" "}
            <span className="text-base font-semibold">
              {singlePayroll?.user?.jobTimeline?.[0]?.seatNo}
            </span>
          </span>
        </div>
      </div>
      <div className="w-full flex justify-between items-center">
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <Card details={details} />
        </div>
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <Card details={details} />
        </div>
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <Card details={availableDate} />
        </div>
      </div>
      <div className="w-full flex justify-between items-start">
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <h3 className="text-base font-semibold font-sans mb-2">Earnings</h3>
          <Card details={eranings} />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-t-gray-700">
            <span className="text-sm font-semibold font-sans">
              Total Earning
            </span>
            <span className="text-green-800 font-semibold text-lg">
              {singlePayroll?.totalEarnings}
            </span>
          </div>
        </div>
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <h3 className="text-base font-semibold font-sans mb-2">Earnings</h3>
          <Card details={ppf} />
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-t-gray-700">
            <span className="text-sm font-semibold font-sans">
              Total Deductions
            </span>
            <span className="text-red-800 font-semibold text-lg">
              {singlePayroll?.totalDeductions}
            </span>
          </div>
        </div>
        <div className="border rounded-md border-gray-600 p-4 w-[350px] flex flex-col gap-3">
          <h3 className="text-base font-semibold font-sans mb-2">Net Salary</h3>
          <Card details={netPay} />
          <div className="w-full flex flex-col gap-2">
            <IconButton
              icon={<Download size={20} color="#fff" />}
              bgColor="#000"
              textColor="#fff"
              text="Download"
            />
            <IconButton
              icon={<Mail size={20} color="#fff" />}
              //   bgColor="#000"
              //   textColor="#fff"
              text="Send Mail"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetails;

const Card = ({ details }) => {
  return (
    <>
      {details?.map((eahc, index) => (
        <div
          key={index}
          className="w-full flex justify-between items-center gap-4"
        >
          <span className="text-sm font-semibold font-sans text-gray-700">
            {eahc?.label}
          </span>
          <span className="text-base font-semibold font-sans text-gray-900">
            {eahc?.value}
          </span>
        </div>
      ))}
    </>
  );
};

const MoneyCard = ({ details }) => {
  return (
    <>
      {details?.map((eahc, index) => (
        <div
          key={index}
          className="w-full flex justify-between items-center gap-4"
        >
          <span className="text-sm font-semibold font-sans text-gray-700">
            {eahc?.label}
          </span>
          <span className="text-base font-semibold font-sans text-gray-900">
            {eahc?.value}
          </span>
        </div>
      ))}
    </>
  );
};
