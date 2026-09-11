import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleAlert,
  XCircle,
  Plus,
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
} from "lucide-react";
import { API } from "../../../Core/url";

const EmpLeavesScreen = () => {
  const { token } = useSelector((state) => state.auth);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    document: null,
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [usedByType, setUsedByType] = useState({});

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const leaveTypeLabels = {
    casual: "Casual Leave",
    sick: "Sick Leave",
    annual: "Annual Leave",
    emergency: "Emergency Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    unpaid: "Unpaid Leave",
  };

  const leaveBalances = Object.entries(usedByType).map(([type, used]) => ({
    type: leaveTypeLabels[type] || type,
    total: Number(used) || 0,
    used: Number(used) || 0,
    remaining: 0,
  }));

  const totalUsedLeave = Object.values(usedByType).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );

  const formatLeave = (leave) => ({
    id: leave._id || leave.id,
    leaveType: leaveTypeLabels[leave.leaveType] || leave.leaveType,
    startDate: formatDate(leave.startDate),
    endDate: formatDate(leave.endDate),
    duration: Number(leave.numberOfDays || leave.duration || 0),
    reason: leave.reason || "",
    appliedOn: formatDate(leave.createdAt) || "--",
    status: leave.status || "Pending",
  });

  const fetchLeaves = async () => {
    if (!token) return;
    try {
      const params = { page: 1, limit: 100 };
      if (debouncedSearch) params.search = debouncedSearch;
      const [leavesResponse, balanceResponse] = await Promise.all([
        API.get("/leaves", { ...authConfig, params }),
        API.get("/leaves/balance", authConfig),
      ]);
      setLeaveRequests((leavesResponse?.data?.data || []).map(formatLeave));
      setUsedByType(balanceResponse?.data?.data?.used || {});
    } catch (error) {
      console.error("Failed to fetch leave data:", error);
      setLeaveRequests([]);
      setUsedByType({});
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchLeaves();
  }, [debouncedSearch, token]);

  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      return 0;
    }

    const difference =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return difference;
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason ||
      duration <= 0
    ) {
      return;
    }

    const payload = new FormData();
    payload.append(
      "leaveType",
      formData.leaveType.toLowerCase().replace(" leave", ""),
    );
    payload.append("startDate", formData.startDate);
    payload.append("endDate", formData.endDate);
    payload.append("reason", formData.reason);
    if (formData.document) payload.append("document", formData.document);

    API.post("/leaves", payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async () => {
        await fetchLeaves();
        setFormData({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          document: null,
        });
        setShowApplyModal(false);
      })
      .catch((error) => console.error("Failed to apply for leave:", error));
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Leave Management</p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Leaves
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Apply for leave and track your leave requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          <Plus size={18} />
          Apply Leave
        </button>
      </section>

      {/* Leave Balance */}
      <section>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Leave Balance
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Your available leave balance
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {leaveBalances.map((leave) => (
            <LeaveBalanceCard key={leave.type} {...leave} />
          ))}
        </div>
      </section>

      {/* Leave Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Leave"
          value={`${leaveBalances.reduce((sum, leave) => sum + leave.total, 0)} days`}
          subtitle="Configured leave allocation"
          icon={CalendarDays}
        />

        <SummaryCard
          title="Used Leave"
          value={`${totalUsedLeave} days`}
          subtitle="Leave used this year"
          icon={Clock3}
        />

        <SummaryCard
          title="Pending Requests"
          value={
            leaveRequests.filter((item) => item.status === "Pending").length
          }
          subtitle="Awaiting approval"
          icon={CircleAlert}
        />
      </section>

      {/* Leave History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Leave History
            </h3>

            <p className="text-xs text-slate-500">
              View your submitted leave requests and their status.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leave type, reason..."
              className="h-10 w-full pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </tr>
            </thead>

            <tbody>
              {leaveRequests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CalendarDays size={17} />
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {request.leaveType}
                        </p>

                        <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                          {request.reason}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{request.startDate}</TableCell>

                  <TableCell>{request.endDate}</TableCell>

                  <TableCell>
                    {request.duration} {request.duration === 1 ? "day" : "days"}
                  </TableCell>

                  <TableCell>{request.appliedOn}</TableCell>

                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            Showing <span className="font-medium text-slate-700">1–4</span> of{" "}
            <span className="font-medium text-slate-700">4</span> leave requests
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-medium text-white"
            >
              1
            </button>

            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <ApplyLeaveModal
          formData={formData}
          duration={duration}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => setShowApplyModal(false)}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------- */
/* Components */
/* -------------------------------------------------- */

const LeaveBalanceCard = ({ type, total, used, remaining }) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{type}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {remaining}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {remaining} of {total} days remaining
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <CalendarDays size={19} />
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-400">{used} days used</p>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const SummaryCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const TableHead = ({ children }) => (
  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-5 py-4 text-sm text-slate-600">{children}</td>
);

const StatusBadge = ({ status }) => {
  const config = {
    Approved: {
      className: "bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    Pending: {
      className: "bg-amber-50 text-amber-700",
      icon: CircleAlert,
    },
    Rejected: {
      className: "bg-red-50 text-red-700",
      icon: XCircle,
    },
  };

  const current = config[status] || config.Pending;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${current.className}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
};

const ApplyLeaveModal = ({
  formData,
  duration,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Apply for Leave
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Submit your leave request for approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Leave Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Leave Type
            </label>

            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={onChange}
              required
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select leave type</option>

              <option value="Casual Leave">Casual Leave</option>

              <option value="Sick Leave">Sick Leave</option>

              <option value="Annual Leave">Annual Leave</option>

              <option value="Emergency Leave">Emergency Leave</option>

              <option value="Maternity Leave">Maternity Leave</option>

              <option value="Paternity Leave">Paternity Leave</option>

              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onChange}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={onChange}
                required
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="rounded-xl bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 size={17} className="text-blue-600" />

                <span className="text-sm font-medium text-slate-700">
                  Leave Duration
                </span>
              </div>

              <span className="text-sm font-bold text-blue-600">
                {duration} {duration === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason
            </label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={onChange}
              required
              rows={4}
              placeholder="Enter the reason for your leave..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Supporting Document */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Supporting Document
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 transition hover:border-blue-400 hover:bg-blue-50/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                {formData.document ? (
                  <FileText size={18} />
                ) : (
                  <Upload size={18} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">
                  {formData.document
                    ? formData.document.name
                    : "Upload supporting document"}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">PDF, JPG or PNG</p>
              </div>

              <input
                type="file"
                name="document"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default EmpLeavesScreen;
