import { useEffect, useState } from "react";
import { getPayrollEveryMonth } from "../Services/hr-payroll.service";

export const useHrPayrollListHook = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [payroll, setPayroll] = useState([]);

  const fetchPayroll = async ({ page = 1, search = "" }) => {
    setLoading(true);
    const data = await getPayrollEveryMonth({
      month,
      page,
      search,
      token,
      limit: 10,
    });

    if (data?.status) {
      setPayroll(data?.res?.payrolls);
      setTotalPages(data?.res?.totalPages);
    } else {
      setError(data?.errMsg);
    }

    setLoading(false);
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // debounce delay

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchPayroll({ page: currentPage + 1, search: debouncedSearchText });
  }, [debouncedSearchText, currentPage, month, fetchPayroll]);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    // fetchContact({ page: event.selected + 1 });
  };

  const searchContact = (text) => {
    setSearchText(text);
    setCurrentPage(0);
  };

  return {
    loading,
    error,
    currentPage,
    totalPages,
    month,
    setMonth,
    payroll,
    searchText,
    handlePageClick,
    searchContact,
  };
};
