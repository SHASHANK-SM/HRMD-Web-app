import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Download,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const LeavesManagementScreen = () => {
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("All Leave Types");
  const [status, setStatus] = useState("All Status");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [requests, setRequests] = useState([
    {
      id: "LR001",
      employee: "Priya Sharma",
      employeeId: "EMP002",
      department: "HR",
      type: "Casual Leave",
      startDate: "05 Sep 2026",
      endDate: "06 Sep 2026",
      days: 2,
      reason: "Personal work",
      appliedOn: "03 Sep 2026",
      status: "Pending",
    },
    {
      id: "LR002",
      employee: "Rahul Kumar",
      employeeId: "EMP003",
      department: "Finance",
      type: "Sick Leave",
      startDate: "07 Sep 2026",
      endDate: "08 Sep 2026",
      days: 2,
      reason: "Not feeling well",
      appliedOn: "03 Sep 2026",
      status: "Approved",
    },
    {
      id: "LR003",
      employee: "Sneha Reddy",
      employeeId: "EMP004",
      department: "Marketing",
      type: "Annual Leave",
      startDate: "10 Sep 2026",
      endDate: "12 Sep 2026",
      days: 3,
      reason: "Family vacation",
      appliedOn: "02 Sep 2026",
      status: "Pending",
    },
    {
      id: "LR004",
      employee: "Arjun Patel",
      employeeId: "EMP005",
      department: "Engineering",
      type: "Casual Leave",
      startDate: "12 Sep 2026",
      endDate: "12 Sep 2026",
      days: 1,
      reason: "Personal work",
      appliedOn: "01 Sep 2026",
      status: "Rejected",
    },
    {
      id: "LR005",
      employee: "Ananya Singh",
      employeeId: "EMP006",
      department: "Sales",
      type: "Emergency Leave",
      startDate: "15 Sep 2026",
      endDate: "16 Sep 2026",
      days: 2,
      reason: "Family emergency",
      appliedOn: "03 Sep 2026",
      status: "Pending",
    },
    {
      id: "LR006",
      employee: "Vikram Rao",
      employeeId: "EMP007",
      department: "Engineering",
      type: "Annual Leave",
      startDate: "18 Sep 2026",
      endDate: "20 Sep 2026",
      days: 3,
      reason: "Personal vacation",
      appliedOn: "30 Aug 2026",
      status: "Approved",
    },
    {
      id: "LR007",
      employee: "Meera Nair",
      employeeId: "EMP008",
      department: "Operations",
      type: "Sick Leave",
      startDate: "22 Sep 2026",
      endDate: "22 Sep 2026",
      days: 1,
      reason: "Medical appointment",
      appliedOn: "02 Sep 2026",
      status: "Pending",
    },
  ]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const text = search.toLowerCase();

      const matchesSearch =
        request.employee.toLowerCase().includes(text) ||
        request.employeeId.toLowerCase().includes(text);

      const matchesType =
        leaveType === "All Leave Types" ||
        request.type === leaveType;

      const matchesStatus =
        status === "All Status" ||
        request.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, search, leaveType, status]);

  const updateStatus = (id, newStatus) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status: newStatus }
          : request
      )
    );

    setSelectedLeave(null);
  };

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Leave Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Review, approve and manage employee leave requests.
          </p>
        </div>

        <button
          type="button"
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
        >
          <Download size={16} />
          Export
        </button>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <LeaveSummary
          icon={FileText}
          label="Total Requests"
          value={requests.length}
          color="blue"
        />

        <LeaveSummary
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="amber"
        />

        <LeaveSummary
          icon={CheckCircle2}
          label="Approved"
          value={approvedCount}
          color="emerald"
        />

        <LeaveSummary
          icon={XCircle}
          label="Rejected"
          value={rejectedCount}
          color="red"
        />

      </div>

      {/* Requests */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* Top */}
        <div className="p-4 sm:p-5 border-b border-slate-100">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            <div>
              <h2 className="font-semibold text-slate-900">
                Leave Requests
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredRequests.length} requests found
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden self-start flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

          </div>

          {/* Filters */}
          <div
            className={`mt-4 ${
              showFilters ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row gap-3`}
          >

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee or ID..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Leave Types</option>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Annual Leave</option>
              <option>Emergency Leave</option>
              <option>Maternity Leave</option>
              <option>Paternity Leave</option>
              <option>Unpaid Leave</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>

          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">

                <Heading>Employee</Heading>
                <Heading>Department</Heading>
                <Heading>Leave Type</Heading>
                <Heading>Duration</Heading>
                <Heading>Applied On</Heading>
                <Heading>Status</Heading>
                <Heading>Action</Heading>

              </tr>
            </thead>

            <tbody>

              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (

                  <tr
                    key={request.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >

                    {/* Employee */}
                    <td className="px-4 sm:px-5 py-4">

                      <div className="flex items-center gap-3">

                        <Avatar name={request.employee} />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {request.employee}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {request.employeeId}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">
                        {request.department}
                      </span>
                    </td>

                    {/* Leave type */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-700">
                        {request.type}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-4">

                      <p className="text-xs text-slate-700">
                        {request.startDate === request.endDate
                          ? request.startDate
                          : `${request.startDate.replace(
                              " 2026",
                              ""
                            )} - ${request.endDate.replace(
                              " 2026",
                              ""
                            )}`}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {request.days}{" "}
                        {request.days === 1 ? "Day" : "Days"}
                      </p>

                    </td>

                    {/* Applied */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">
                        {request.appliedOn}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={request.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4">

                      <div className="flex items-center gap-1">

                        <button
                          type="button"
                          title="View details"
                          onClick={() =>
                            setSelectedLeave(request)
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={16} />
                        </button>

                        {request.status === "Pending" && (
                          <>
                            <button
                              type="button"
                              title="Approve"
                              onClick={() =>
                                updateStatus(
                                  request.id,
                                  "Approved"
                                )
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-50"
                            >
                              <Check size={16} />
                            </button>

                            <button
                              type="button"
                              title="Reject"
                              onClick={() =>
                                updateStatus(
                                  request.id,
                                  "Rejected"
                                )
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">

                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Users
                          size={20}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        No leave requests found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>

                    </div>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filteredRequests.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {requests.length}
            </span>{" "}
            requests
          </p>

          <div className="flex items-center gap-1">

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronLeft size={16} />
            </button>

            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs">
              1
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 text-xs text-slate-600">
              2
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>

          </div>

        </div>

      </div>

      {/* Details Modal */}
      {selectedLeave && (
        <LeaveDetailsModal
          request={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          onApprove={() =>
            updateStatus(selectedLeave.id, "Approved")
          }
          onReject={() =>
            updateStatus(selectedLeave.id, "Rejected")
          }
        />
      )}

    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const LeaveSummary = ({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  label,
  value,
  color,
}) => {

  const styles = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

      <div
        className={`w-9 h-9 rounded-lg ${styles[color].bg} flex items-center justify-center`}
      >
        <Icon
          size={18}
          className={styles[color].icon}
        />
      </div>

      <p className="text-xs text-slate-500 mt-3">
        {label}
      </p>

      <p className="text-xl font-bold text-slate-900 mt-1">
        {value}
      </p>

    </div>
  );
};


/* =========================================================
   TABLE HEADING
========================================================= */

const Heading = ({ children }) => (
  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);


/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({ name }) => {

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
      {initials}
    </div>
  );
};


/* =========================================================
   STATUS
========================================================= */

const StatusBadge = ({ status }) => {

  const config = {
    Pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      icon: Clock,
    },

    Approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      icon: CheckCircle2,
    },

    Rejected: {
      bg: "bg-red-50",
      text: "text-red-600",
      icon: XCircle,
    },
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${current.bg} ${current.text}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
};


/* =========================================================
   DETAILS MODAL
========================================================= */

const LeaveDetailsModal = ({
  request,
  onClose,
  onApprove,
  onReject,
}) => {

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-slate-900">
              Leave Request Details
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Request ID: {request.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>

        </div>

        {/* Employee */}
        <div className="p-5">

          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">

            <Avatar name={request.employee} />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {request.employee}
              </p>

              <p className="text-xs text-slate-400">
                {request.employeeId} • {request.department}
              </p>
            </div>

          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">

            <Detail
              label="Leave Type"
              value={request.type}
            />

            <Detail
              label="Duration"
              value={`${request.days} ${
                request.days === 1 ? "Day" : "Days"
              }`}
            />

            <Detail
              label="Start Date"
              value={request.startDate}
            />

            <Detail
              label="End Date"
              value={request.endDate}
            />

            <Detail
              label="Applied On"
              value={request.appliedOn}
            />

            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Status
              </p>

              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>

          </div>

          {/* Reason */}
          <div className="mt-5">

            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Reason
            </p>

            <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                {request.reason}
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          {request.status === "Pending" && (
            <>
              <button
                onClick={onReject}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100"
              >
                <X size={15} />
                Reject
              </button>

              <button
                onClick={onApprove}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                <Check size={15} />
                Approve
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   DETAIL
========================================================= */

const Detail = ({
  label,
  value,
}) => (
  <div>

    <p className="text-[10px] uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="text-sm text-slate-700 mt-1">
      {value}
    </p>

  </div>
);

export default LeavesManagementScreen;