import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";
import {
  Search,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
} from "lucide-react";

const HrPayslipScreen = () => {
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const samplePayslips = [
    {
      id: "PS001",
      employee: "John Doe",
      employeeId: "EMP001",
      department: "Engineering",
      designation: "Software Engineer",
      month: "September 2026",
      basic: 45000,
      allowances: 8000,
      deductions: 3000,
      netSalary: 50000,
      generatedOn: "01 Sep 2026",
      status: "Generated",
    },
    {
      id: "PS002",
      employee: "Priya Sharma",
      employeeId: "EMP002",
      department: "HR",
      designation: "HR Executive",
      month: "September 2026",
      basic: 40000,
      allowances: 7000,
      deductions: 2500,
      netSalary: 44500,
      generatedOn: "01 Sep 2026",
      status: "Generated",
    },
    {
      id: "PS003",
      employee: "Rahul Kumar",
      employeeId: "EMP003",
      department: "Finance",
      designation: "Financial Analyst",
      month: "September 2026",
      basic: 48000,
      allowances: 9000,
      deductions: 4000,
      netSalary: 53000,
      generatedOn: "02 Sep 2026",
      status: "Generated",
    },
    {
      id: "PS004",
      employee: "Sneha Reddy",
      employeeId: "EMP004",
      department: "Marketing",
      designation: "Marketing Executive",
      month: "September 2026",
      basic: 42000,
      allowances: 6000,
      deductions: 2500,
      netSalary: 45500,
      generatedOn: "02 Sep 2026",
      status: "Generated",
    },
    {
      id: "PS005",
      employee: "Arjun Patel",
      employeeId: "EMP005",
      department: "Engineering",
      designation: "Frontend Developer",
      month: "September 2026",
      basic: 50000,
      allowances: 10000,
      deductions: 4500,
      netSalary: 55500,
      generatedOn: "03 Sep 2026",
      status: "Pending",
    },
    {
      id: "PS006",
      employee: "Ananya Singh",
      employeeId: "EMP006",
      department: "Sales",
      designation: "Sales Executive",
      month: "September 2026",
      basic: 38000,
      allowances: 6500,
      deductions: 2000,
      netSalary: 42500,
      generatedOn: "03 Sep 2026",
      status: "Generated",
    },
  ];
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    if (!token) return;
    API.get("/payroll", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const records = response?.data?.data || [];
        setPayslips(
          records.map((record) => ({
            id: record._id,
            employee: record.empId?.name || "-",
            employeeId: record.empId?.empId || record.empId || "-",
            department: record.empId?.department?.title || "-",
            designation: record.empId?.jobTitle || "-",
            month: `${record.month || "-"} ${record.year || ""}`.trim(),
            basic: Number(record.baseSalary || 0),
            allowances:
              Number(record.totalEarnings || 0) -
              Number(record.baseSalary || 0),
            deductions: Number(record.totalDeduction || 0),
            netSalary: Number(record.netSalary || 0),
            generatedOn: record.createdAt || "-",
            status: String(record.status || "generated").replace(
              /^./,
              (letter) => letter.toUpperCase(),
            ),
          })),
        );
      })
      .catch((error) => console.error("Failed to fetch HR payslips:", error));
  }, [token]);

  const filteredPayslips = useMemo(() => {
    return payslips.filter((payslip) => {
      const text = search.toLowerCase();

      const matchesSearch =
        payslip.employee.toLowerCase().includes(text) ||
        payslip.employeeId.toLowerCase().includes(text);

      const matchesStatus =
        status === "All Status" || payslip.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status, payslips]);

  const generatedCount = payslips.filter(
    (item) => item.status === "Generated",
  ).length;

  const pendingCount = payslips.filter(
    (item) => item.status === "Pending",
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Payslips
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Generate, view and manage employee payslips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={17} />
            Generate Payslip
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={FileText}
          label="Total Payslips"
          value={payslips.length}
          color="blue"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Generated"
          value={generatedCount}
          color="emerald"
        />

        <SummaryCard
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="amber"
        />

        <SummaryCard
          icon={Users}
          label="Employees"
          value="125"
          color="purple"
        />
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Top */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Employee Payslips
              </h2>

              <p className="text-xs text-slate-400 mt-1">September 2026</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employee..."
                  className="w-full sm:w-56 h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
              >
                <option>All Status</option>
                <option>Generated</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Heading>Employee</Heading>
                <Heading>Department</Heading>
                <Heading>Month</Heading>
                <Heading>Net Salary</Heading>
                <Heading>Generated On</Heading>
                <Heading>Status</Heading>
                <Heading>Action</Heading>
              </tr>
            </thead>

            <tbody>
              {filteredPayslips.map((payslip) => (
                <tr
                  key={payslip.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  {/* Employee */}
                  <td className="px-4 sm:px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={payslip.employee} />

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {payslip.employee}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {payslip.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-700">
                      {payslip.department}
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {payslip.designation}
                    </p>
                  </td>

                  {/* Month */}
                  <td className="px-4 py-4 text-xs text-slate-600">
                    {payslip.month}
                  </td>

                  {/* Net salary */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-slate-800">
                      ₹{payslip.netSalary.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Generated */}
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {payslip.generatedOn}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <PayslipStatus status={payslip.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="View payslip"
                        onClick={() => setSelectedPayslip(payslip)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={16} />
                      </button>

                      {payslip.status === "Generated" && (
                        <button
                          type="button"
                          title="Download"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Download size={16} />
                        </button>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filteredPayslips.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {payslips.length}
            </span>{" "}
            payslips
          </p>

          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
              <ChevronLeft size={16} />
            </button>

            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs">
              1
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 text-xs text-slate-600">
              2
            </button>

            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Preview */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  label,
  value,
  color,
}) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles[color]}`}
      >
        <Icon size={18} />
      </div>

      <p className="text-xs text-slate-500 mt-3">{label}</p>

      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
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
    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold">
      {initials}
    </div>
  );
};

/* =========================================================
   STATUS
========================================================= */

const PayslipStatus = ({ status }) => {
  if (status === "Generated") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
        <CheckCircle2 size={11} />
        Generated
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium">
      <Clock size={11} />
      Pending
    </span>
  );
};

/* =========================================================
   PAYSLIP MODAL
========================================================= */

const PayslipModal = ({ payslip, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Payslip Preview</h2>

            <p className="text-xs text-slate-400 mt-1">
              {payslip.month} • {payslip.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Payslip */}
        <div className="p-5 sm:p-7">
          {/* Company */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <FileText size={21} className="text-white" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">HRMS Company</h3>

                <p className="text-xs text-slate-400">Salary Payslip</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">Pay Period</p>

              <p className="text-sm font-semibold text-slate-800">
                {payslip.month}
              </p>
            </div>
          </div>

          {/* Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-5 border-b border-slate-200">
            <Info label="Employee Name" value={payslip.employee} />

            <Info label="Employee ID" value={payslip.employeeId} />

            <Info label="Department" value={payslip.department} />

            <Info label="Designation" value={payslip.designation} />
          </div>

          {/* Salary */}
          <div className="py-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Salary Details
            </h3>

            <div className="space-y-3">
              <SalaryRow
                label="Basic Salary"
                value={`₹${payslip.basic.toLocaleString("en-IN")}`}
              />

              <SalaryRow
                label="Allowances"
                value={`₹${payslip.allowances.toLocaleString("en-IN")}`}
                positive
              />

              <SalaryRow
                label="Deductions"
                value={`₹${payslip.deductions.toLocaleString("en-IN")}`}
                negative
              />
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-800">Net Salary</span>

              <span className="text-xl font-bold text-blue-600">
                ₹{payslip.netSalary.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              This is a system-generated payslip.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            <Printer size={15} />
            Print
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   INFO
========================================================= */

const Info = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="text-sm text-slate-700 mt-1">{value}</p>
  </div>
);

/* =========================================================
   SALARY ROW
========================================================= */

const SalaryRow = ({ label, value, positive, negative }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-500">{label}</span>

    <span
      className={`text-sm font-medium ${
        positive
          ? "text-emerald-600"
          : negative
            ? "text-red-500"
            : "text-slate-800"
      }`}
    >
      {positive ? "+" : negative ? "-" : ""}
      {value}
    </span>
  </div>
);

export default HrPayslipScreen;
