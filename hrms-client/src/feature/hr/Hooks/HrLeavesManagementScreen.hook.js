import { useEffect, useState } from "react";
import { hrLeavesGetApi } from "../Services/hr-leaves-management";

export const useLeavesManagementHook = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [status, setStatus] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async ({ page = 1 }) => {
    setLoading(true);
    const data = await hrLeavesGetApi({
      leaveType: leaveType === "all" ? "" : leaveType,
      limit: 10,
      page,
      status: status === "all" ? "" : status,
      token,
    });

    if (data?.status) {
      setLeaves(data?.apiRes?.leaves);
      setTotalPages(data?.apiRes?.totalPages);
      setCurrentPage(data?.apiRes?.currentPage);
    } else {
      setError(data?.errMsg);
    }
    setLoading(false);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    fetchLeaves({ page: event.selected + 1 });
  };

  useEffect(() => {
    fetchLeaves({ page: 1 });
  }, [status, leaveType, fetchLeaves]);

  return {
    leaves,
    loading,
    error,
    totalPages,
    currentPage,
    handlePageClick,
    setStatus,
    setLeaveType,
    status,
    leaveType,
    fetchLeaves,
  };
};
