import React from "react";
import Search from "../../../Utils/Search";
import Select from "../../../Utils/Select";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import {
  setDepartment,
  setSearchText,
  setStatus,
} from "../Slices/HrEmployeeSlice";

const HrEmployeesFilterCard = () => {
  const dispatch = useDispatch();

  const { searchText, department, status } = useSelector(
    (state) => state.employeeList
  );

  const handleSearch = (text) => {
    dispatch(setSearchText(text));
  };

  const handleDepartMent = (text) => {
    dispatch(setDepartment(text));
  };

  const handleSetStatus = (text) => {
    dispatch(setStatus(text));
  };

  return (
    <div className="w-full flex justify-between items-center">
      <Search
        anotherStyle="w-[300px]"
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
      />
      <div className="flex items-center gap-4">
        <Select
          options={[{ label: "Software", value: "software" }]}
          name="department"
          onChange={(e) => {
            handleDepartMent(e.target.value);
          }}
          value={department}
          firstOption={"Department"}
          width="w-[220px]"
        />
        <Select
          options={[
            { label: "Active", value: "active" },
            { label: "In-Active", value: "inactive" },
          ]}
          name="status"
          onChange={(e) => {
            handleSetStatus(e.target.value);
          }}
          value={status}
          firstOption={"Status"}
          width="w-[220px]"
        />
        {/* <DatePicker
          //   selected={date}
          //   onChange={(selectedDate) => {
          //     const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
          //     setDate(formatted);
          //   }}
          dateFormat="yyyy-MM-dd"
          className="border border-gray-300 rounded-md p-2"
          placeholderText="YYYY-MM-DD"
          // minDate={new Date()} // disables past dates
        /> */}
      </div>
    </div>
  );
};

export default HrEmployeesFilterCard;
