import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";
import {
  Search,
  Download,
  WalletCards,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const HrPayrollList = () => {
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  const samplePayrolls = [
    {
      id: "PAY001",
      employee: "John Doe",
      employeeId: "EMP001",
      department: "Engineering",
      designation: "Software Engineer",
      month: "September 2026",
      basic: 45000,
      allowances: 8000,
      deductions: 3000,
      netSalary: 50000,
      status: "Processed",
    },
    {
      id: "PAY002",
      employee: "Priya Sharma",
      employeeId: "EMP002",
      department: "HR",
      designation: "HR Executive",
      month: "September 2026",
      basic: 40000,
      allowances: 7000,
      deductions: 2500,
      netSalary: 44500,
      status: "Processed",
    },
    {
      id: "PAY003",
      employee: "Rahul Kumar",
      employeeId: "EMP003",
      department: "Finance",
      designation: "Financial Analyst",
      month: "September 2026",
      basic: 48000,
      allowances: 9000,
      deductions: 4000,
      netSalary: 53000,
      status: "Pending",
    },
    {
      id: "PAY004",
      employee: "Sneha Reddy",
      employeeId: "EMP004",
      department: "Marketing",
      designation: "Marketing Executive",
      month: "September 2026",
      basic: 42000,
      allowances: 6000,
      deductions: 2500,
      netSalary: 45500,
      status: "Processed",
    },
    {
      id: "PAY005",
      employee: "Arjun Patel",
      employeeId: "EMP005",
      department: "Engineering",
      designation: "Frontend Developer",
      month: "September 2026",
      basic: 50000,
      allowances: 10000,
      deductions: 4500,
      netSalary: 55500,
      status: "Pending",
    },
    {
      id: "PAY006",
      employee: "Ananya Singh",
      employeeId: "EMP006",
      department: "Sales",
      designation: "Sales Executive",
      month: "September 2026",
      basic: 38000,
      allowances: 6500,
      deductions: 2000,
      netSalary: 42500,
      status: "Processed",
    },
    {
      id: "PAY007",
      employee: "Vikram Rao",
      employeeId: "EMP007",
      department: "Engineering",
      designation: "Backend Developer",
      month: "September 2026",
      basic: 52000,
      allowances: 9000,
      deductions: 5000,
      netSalary: 56000,
      status: "Pending",
    },
  ];
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    if (!token) return;
    API.get("/payroll", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const records = response?.data?.data || [];
        setPayrolls(
          records.map((record) => ({
            id: record._id,
            employee: record.empId?.name || "-",
            employeeId: record.empId?.empId || record.empId || "-",
            department: record.empId?.department?.title || "-",
            designation: record.empId?.jobTitle || "-",
            month: `${record.month || "-"} ${record.year || ""}`.trim(),
            basic: Number(record.baseSalary || 0),
            allowances:
              Number(record.totalEarnings || record.grossSalary || 0) -
              Number(record.baseSalary || 0),
            deductions: Number(record.totalDeduction || 0),
            netSalary: Number(record.netSalary || 0),
            status: String(record.status || "pending").replace(/^./, (letter) =>
              letter.toUpperCase(),
            ),
          })),
        );
      })
      .catch((error) => console.error("Failed to fetch payroll:", error));
  }, [token]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((payroll) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        payroll.employee.toLowerCase().includes(searchText) ||
        payroll.employeeId.toLowerCase().includes(searchText);

      const matchesDepartment =
        department === "All Departments" || payroll.department === department;

      const matchesStatus =
        status === "All Status" || payroll.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [payrolls, search, department, status]);

  const processedCount = payrolls.filter(
    (item) => item.status === "Processed",
  ).length;

  const pendingCount = payrolls.filter(
    (item) => item.status === "Pending",
  ).length;

  const totalPayroll = payrolls.reduce((sum, item) => sum + item.netSalary, 0);

  const processPayroll = (id) => {
    setPayrolls((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Processed" } : item,
      ),
    );
  };

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Payroll Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage monthly salary processing, deductions and payments.
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
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <WalletCards size={16} />
            Process Payroll
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PayrollSummary
          icon={WalletCards}
          label="Total Payroll"
          value={`₹${totalPayroll.toLocaleString("en-IN")}`}
          color="blue"
        />

        <PayrollSummary
          icon={CheckCircle2}
          label="Processed"
          value={processedCount}
          color="emerald"
        />

        <PayrollSummary
          icon={Clock}
          label="Pending"
          value={pendingCount}
          color="amber"
        />

        <PayrollSummary
          icon={AlertCircle}
          label="Employees Paid"
          value={processedCount}
          color="purple"
        />
      </div>

      {/* PAYROLL TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* TABLE HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">Monthly Payroll</h2>

              <p className="text-xs text-slate-400 mt-1">
                September 2026 payroll records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* SEARCH */}
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

              {/* DEPARTMENT */}
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
              >
                <option>All Departments</option>
                <option>Engineering</option>
                <option>HR</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Sales</option>
              </select>

              {/* STATUS */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
              >
                <option>All Status</option>
                <option>Processed</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <TableHeading>Employee</TableHeading>

                <TableHeading>Department</TableHeading>

                <TableHeading>Basic Salary</TableHeading>

                <TableHeading>Allowances</TableHeading>

                <TableHeading>Deductions</TableHeading>

                <TableHeading>Net Salary</TableHeading>

                <TableHeading>Status</TableHeading>

                <TableHeading>Action</TableHeading>
              </tr>
            </thead>

            <tbody>
              {filteredPayrolls.length > 0 ? (
                filteredPayrolls.map((payroll) => (
                  <tr
                    key={payroll.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    {/* EMPLOYEE */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={payroll.employee} />

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {payroll.employee}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {payroll.employeeId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-700">
                        {payroll.department}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {payroll.designation}
                      </p>
                    </td>

                    {/* BASIC */}
                    <td className="px-4 py-4 text-xs text-slate-700">
                      ₹{payroll.basic.toLocaleString("en-IN")}
                    </td>

                    {/* ALLOWANCES */}
                    <td className="px-4 py-4 text-xs text-emerald-600">
                      +₹{payroll.allowances.toLocaleString("en-IN")}
                    </td>

                    {/* DEDUCTIONS */}
                    <td className="px-4 py-4 text-xs text-red-500">
                      -₹{payroll.deductions.toLocaleString("en-IN")}
                    </td>

                    {/* NET */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{payroll.netSalary.toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <PayrollStatus status={payroll.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View payroll"
                          onClick={() => setSelectedPayroll(payroll)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Payslip"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <FileText size={16} />
                        </button>

                        {payroll.status === "Pending" && (
                          <button
                            type="button"
                            title="Process payroll"
                            onClick={() => processPayroll(payroll.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-50"
                          >
                            <CheckCircle2 size={16} />
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <WalletCards size={20} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-700 mt-3">
                        No payroll records found
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

        {/* FOOTER */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-600">
              {filteredPayrolls.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">
              {payrolls.length}
            </span>{" "}
            employees
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

      {/* DETAILS MODAL */}
      {selectedPayroll && (
        <PayrollDetailsModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </div>
  );
};

/* =========================================================
   SUMMARY
========================================================= */

const PayrollSummary = ({
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

const TableHeading = ({ children }) => (
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

const PayrollStatus = ({ status }) => {
  if (status === "Processed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
        <CheckCircle2 size={11} />
        Processed
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
   DETAILS MODAL
========================================================= */

const PayrollDetailsModal = ({ payroll, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Payroll Details</h2>

            <p className="text-xs text-slate-400 mt-1">
              {payroll.month} • {payroll.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          {/* EMPLOYEE */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <Avatar name={payroll.employee} />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                {payroll.employee}
              </p>

              <p className="text-xs text-slate-400">
                {payroll.employeeId} • {payroll.department}
              </p>
            </div>
          </div>

          {/* SALARY */}
          <div className="mt-5 space-y-3">
            <SalaryRow
              label="Basic Salary"
              value={`₹${payroll.basic.toLocaleString("en-IN")}`}
            />

            <SalaryRow
              label="Allowances"
              value={`+₹${payroll.allowances.toLocaleString("en-IN")}`}
              positive
            />

            <SalaryRow
              label="Deductions"
              value={`-₹${payroll.deductions.toLocaleString("en-IN")}`}
              negative
            />

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Net Salary
              </span>

              <span className="text-lg font-bold text-blue-600">
                ₹{payroll.netSalary.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SALARY ROW
========================================================= */

const SalaryRow = ({ label, value, positive, negative }) => {
  return (
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
        {value}
      </span>
    </div>
  );
};

export default HrPayrollList;
