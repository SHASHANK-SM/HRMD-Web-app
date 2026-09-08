import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  setCurrentPage,
} from "../Slices/HrEmployeeSlice";

export const useHrEmployeeManagentScreenHook = () => {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const {
    currentPage,
    searchText,
    department,
    status,
  } = useSelector((state) => state.employeeList);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchEmployees({
          page: currentPage + 1,
          search: searchText,
          department,
          status,
          token,
        })
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, department, status, currentPage, dispatch, token]);

  const handlePageClick = (event) => {
    dispatch(setCurrentPage(event.selected));
  };

  //   const handleSearch = (text) => {
  //   dispatch(setSearchText(text));
  // };

  return { handlePageClick };
};
