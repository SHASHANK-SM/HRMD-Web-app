import React from "react";
import Search from "../../../Utils/Search";
import Select from "../../../Utils/Select";

// Utility function to generate last 24 months in YYYY-MM format
const generateLast24Months = () => {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    months.push({ label: `${year}-${month}`, value: `${year}-${month}` });
  }

  return months;
};

const HrPayrollFilters = ({
  setMonth,
  searchContact,
  searchText,
  isDisplaySeach = true,
  width = "w-full",
  month,
  setStatus,
  status,
}) => {
  const monthOptions = generateLast24Months();

  return (
    <div className={`${width} flex justify-between items-center`}>
      {isDisplaySeach && (
        <Search
          onChange={(e) => searchContact(e.target.value)}
          value={searchText}
          anotherStyle="w-[300px]"
        />
      )}
      <div className="flex items-center gap-4">
        <Select
          onChange={(e) => setMonth(e.target.value)}
          options={monthOptions}
          firstOption={"Month"}
          value={month}
        />
        <Select
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ]}
          firstOption={"Status"}
          value={status}
        />
      </div>
    </div>
  );
};

export default HrPayrollFilters;
