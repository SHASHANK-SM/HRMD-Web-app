import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Users,
  Clock3,
  Wallet,
  X,
} from "lucide-react";

const HrReportsScreen = () => {
  const { token } = useSelector((state) => state.auth);
  const [reportType, setReportType] = useState("Attendance");
  const [period, setPeriod] = useState("September 2026");
  const [department, setDepartment] = useState("All Departments");
  const [showReport, setShowReport] = useState(false);
  const [liveReportRows, setLiveReportRows] = useState([]);

  const attendanceData = [
    {
      employee: "Rahul Sharma",
      id: "EMP001",
      department: "Engineering",
      present: 22,
      absent: 1,
      late: 2,
      percentage: "95.7%",
    },
    {
      employee: "Priya Patel",
      id: "EMP002",
      department: "HR",
      present: 21,
      absent: 2,
      late: 1,
      percentage: "91.3%",
    },
    {
      employee: "Arjun Kumar",
      id: "EMP003",
      department: "Finance",
      present: 20,
      absent: 3,
      late: 3,
      percentage: "87.0%",
    },
    {
      employee: "Sneha Reddy",
      id: "EMP004",
      department: "Engineering",
      present: 23,
      absent: 0,
      late: 1,
      percentage: "100%",
    },
    {
      employee: "Vikram Singh",
      id: "EMP005",
      department: "Marketing",
      present: 19,
      absent: 4,
      late: 2,
      percentage: "82.6%",
    },
    {
      employee: "Ananya Rao",
      id: "EMP006",
      department: "Design",
      present: 22,
      absent: 1,
      late: 0,
      percentage: "95.7%",
    },
  ];

  const leaveData = [
    {
      employee: "Rahul Sharma",
      department: "Engineering",
      casual: 2,
      sick: 1,
      annual: 3,
      unpaid: 0,
      total: 6,
    },
    {
      employee: "Priya Patel",
      department: "HR",
      casual: 1,
      sick: 2,
      annual: 2,
      unpaid: 0,
      total: 5,
    },
    {
      employee: "Arjun Kumar",
      department: "Finance",
      casual: 2,
      sick: 2,
      annual: 1,
      unpaid: 1,
      total: 6,
    },
    {
      employee: "Sneha Reddy",
      department: "Engineering",
      casual: 1,
      sick: 0,
      annual: 2,
      unpaid: 0,
      total: 3,
    },
  ];

  const payrollData = [
    {
      employee: "Rahul Sharma",
      department: "Engineering",
      basic: 55000,
      allowances: 12000,
      deductions: 5000,
      net: 62000,
    },
    {
      employee: "Priya Patel",
      department: "HR",
      basic: 48000,
      allowances: 10000,
      deductions: 4000,
      net: 54000,
    },
    {
      employee: "Arjun Kumar",
      department: "Finance",
      basic: 50000,
      allowances: 11000,
      deductions: 4500,
      net: 56500,
    },
    {
      employee: "Sneha Reddy",
      department: "Engineering",
      basic: 60000,
      allowances: 14000,
      deductions: 5500,
      net: 68500,
    },
  ];

  const filteredAttendance = useMemo(() => {
    const rows = reportType === "Attendance" ? liveReportRows : [];
    if (department === "All Departments") return rows;

    return rows.filter((item) => item.department === department);
  }, [department, attendanceData, liveReportRows, reportType]);

  const filteredLeave = useMemo(() => {
    const rows = reportType === "Leave" ? liveReportRows : [];
    if (department === "All Departments") return rows;

    return rows.filter((item) => item.department === department);
  }, [department, leaveData, liveReportRows, reportType]);

  const filteredPayroll = useMemo(() => {
    const rows = reportType === "Payroll" ? liveReportRows : [];
    if (department === "All Departments") return rows;

    return rows.filter((item) => item.department === department);
  }, [department, payrollData, liveReportRows, reportType]);

  const generateLiveReport = async () => {
    if (!token) return;
    const endpoint =
      reportType === "Attendance"
        ? "attendance"
        : reportType === "Leave"
          ? "leave"
          : "payroll";
    try {
      const response = await API.get(`/reports/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rows = response?.data?.data || [];
      setLiveReportRows(
        rows.map((row) => ({
          ...row,
          employee: row.employee || row.user?.name || row.empId?.name || "-",
          id: row.employeeId || row.user?.empId || row.empId?.empId || "-",
          department:
            row.department ||
            row.user?.department?.title ||
            row.empId?.department?.title ||
            "-",
        })),
      );
      setShowReport(true);
    } catch (error) {
      console.error("Failed to generate HR report:", error);
    }
  };

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const reportTitle =
    reportType === "Attendance"
      ? "Attendance Report"
      : reportType === "Leave"
        ? "Leave Report"
        : "Payroll Report";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Reports
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Generate and review HR reports
        </p>
      </div>

      {/* Report Generator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="font-semibold text-slate-900">Generate Report</h3>

          <p className="mt-1 text-xs text-slate-500">
            Select the report type and filters
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Report Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option>Attendance</option>
              <option>Leave</option>
              <option>Payroll</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Period
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option>September 2026</option>
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department
            </label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>HR</option>
              <option>Finance</option>
              <option>Marketing</option>
              <option>Design</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={generateLiveReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <BarChart3 size={17} />
            Generate Report
          </button>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {reportType === "Attendance" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Employees"
            value={filteredAttendance.length}
            icon={<Users size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Average Attendance"
            value="92.1%"
            icon={<BarChart3 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Total Present"
            value="127"
            icon={<Clock3 size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <SummaryCard
            title="Total Absent"
            value="11"
            icon={<CalendarDays size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>
      )}

      {reportType === "Leave" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Employees"
            value={filteredLeave.length}
            icon={<Users size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Total Leave Days"
            value="20"
            icon={<CalendarDays size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Casual Leave"
            value="6"
            icon={<FileText size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <SummaryCard
            title="Sick Leave"
            value="5"
            icon={<Clock3 size={20} />}
            iconClass="bg-rose-50 text-rose-600"
          />
        </div>
      )}

      {reportType === "Payroll" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Employees"
            value={filteredPayroll.length}
            icon={<Users size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            title="Gross Salary"
            value={formatCurrency(
              filteredPayroll.reduce(
                (sum, item) => sum + item.basic + item.allowances,
                0,
              ),
            )}
            icon={<Wallet size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <SummaryCard
            title="Deductions"
            value={formatCurrency(
              filteredPayroll.reduce((sum, item) => sum + item.deductions, 0),
            )}
            icon={<FileText size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <SummaryCard
            title="Net Payroll"
            value={formatCurrency(
              filteredPayroll.reduce((sum, item) => sum + item.net, 0),
            )}
            icon={<Wallet size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>
      )}

      {/* Report Preview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{reportTitle}</h3>

            <p className="mt-1 text-xs text-slate-500">
              {period} • {department}
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:self-auto">
            <Download size={15} />
            Download
          </button>
        </div>

        <div className="overflow-x-auto">
          {reportType === "Attendance" && (
            <AttendanceTable data={filteredAttendance} />
          )}

          {reportType === "Leave" && <LeaveTable data={filteredLeave} />}

          {reportType === "Payroll" && (
            <PayrollTable
              data={filteredPayroll}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* Generated Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Report Generated
                </h3>

                <p className="text-xs text-slate-500">Your report is ready</p>
              </div>

              <button
                onClick={() => setShowReport(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  {reportTitle}
                </p>

                <p className="mt-1 text-xs text-blue-700">Period: {period}</p>

                <p className="text-xs text-blue-700">
                  Department: {department}
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                The selected report has been generated successfully. The
                download functionality will be connected to the backend during
                API integration.
              </p>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowReport(false)}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, iconClass }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const AttendanceTable = ({ data }) => {
  return (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <TableHeader>Employee</TableHeader>
          <TableHeader>Department</TableHeader>
          <TableHeader>Present</TableHeader>
          <TableHeader>Absent</TableHeader>
          <TableHeader>Late</TableHeader>
          <TableHeader>Attendance</TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <p className="text-sm font-semibold text-slate-800">
                {item.employee}
              </p>

              <p className="text-xs text-slate-500">{item.id}</p>
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
              {item.department}
            </td>

            <td className="px-5 py-4 text-sm font-medium text-emerald-600">
              {item.present}
            </td>

            <td className="px-5 py-4 text-sm font-medium text-rose-600">
              {item.absent}
            </td>

            <td className="px-5 py-4 text-sm font-medium text-amber-600">
              {item.late}
            </td>

            <td className="px-5 py-4">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {item.percentage}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const LeaveTable = ({ data }) => {
  return (
    <table className="w-full min-w-[850px]">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <TableHeader>Employee</TableHeader>
          <TableHeader>Department</TableHeader>
          <TableHeader>Casual</TableHeader>
          <TableHeader>Sick</TableHeader>
          <TableHeader>Annual</TableHeader>
          <TableHeader>Unpaid</TableHeader>
          <TableHeader>Total</TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {data.map((item) => (
          <tr key={item.employee} className="hover:bg-slate-50/70">
            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
              {item.employee}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
              {item.department}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">{item.casual}</td>

            <td className="px-5 py-4 text-sm text-slate-600">{item.sick}</td>

            <td className="px-5 py-4 text-sm text-slate-600">{item.annual}</td>

            <td className="px-5 py-4 text-sm text-slate-600">{item.unpaid}</td>

            <td className="px-5 py-4 text-sm font-bold text-slate-900">
              {item.total}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PayrollTable = ({ data, formatCurrency }) => {
  return (
    <table className="w-full min-w-[900px]">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <TableHeader>Employee</TableHeader>
          <TableHeader>Department</TableHeader>
          <TableHeader>Basic</TableHeader>
          <TableHeader>Allowances</TableHeader>
          <TableHeader>Deductions</TableHeader>
          <TableHeader>Net Salary</TableHeader>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {data.map((item) => (
          <tr key={item.employee} className="hover:bg-slate-50/70">
            <td className="px-5 py-4 text-sm font-semibold text-slate-800">
              {item.employee}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
              {item.department}
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
              {formatCurrency(item.basic)}
            </td>

            <td className="px-5 py-4 text-sm text-emerald-600">
              {formatCurrency(item.allowances)}
            </td>

            <td className="px-5 py-4 text-sm text-rose-600">
              {formatCurrency(item.deductions)}
            </td>

            <td className="px-5 py-4 text-sm font-bold text-slate-900">
              {formatCurrency(item.net)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const TableHeader = ({ children }) => {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
};

export default HrReportsScreen;
