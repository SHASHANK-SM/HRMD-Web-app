import { useEffect, useState } from "react";
import {
  Receipt,
  Download,
  Eye,
  CalendarDays,
  WalletCards,
  TrendingUp,
  FileText,
  X,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";

const EmpPayslipScreen = () => {
  const { token } = useSelector((state) => state.auth);

  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [employee, setEmployee] = useState({
    name: "",
    employeeId: "",
    department: "",
    designation: "",
  });

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "₹0";
    }

    if (typeof value === "string") {
      if (value.includes("₹")) return value;

      const numericValue = Number(value.replace(/[^0-9.-]+/g, ""));

      if (!Number.isNaN(numericValue)) {
        return `₹${numericValue.toLocaleString("en-IN")}`;
      }

      return value;
    }

    if (typeof value === "number") {
      return `₹${value.toLocaleString("en-IN")}`;
    }

    return String(value);
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonth = (value) => {
    if (!value) return "";

    if (typeof value === "string" && /^[A-Za-z]+\s+\d{4}$/.test(value.trim())) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getNestedValue = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.title ||
        value.departmentName ||
        value.designation ||
        value.fullName ||
        fallback
      );
    }

    return value;
  };

  const normalizePayslip = (payslip) => {
    const month =
      payslip.month ||
      payslip.payMonth ||
      payslip.salaryMonth ||
      payslip.monthYear ||
      payslip.payPeriod ||
      "";

    const basicSalary =
      payslip.basicSalary ?? payslip.basic ?? payslip.salary?.basicSalary ?? 0;

    const allowances =
      payslip.allowances ??
      payslip.totalAllowances ??
      payslip.salary?.allowances ??
      0;

    const deductions =
      payslip.deductions ??
      payslip.totalDeductions ??
      payslip.salary?.deductions ??
      0;

    const netSalary =
      payslip.netSalary ?? payslip.netPay ?? payslip.salary?.netSalary ?? 0;

    const generatedOn =
      payslip.generatedOn ||
      payslip.generatedAt ||
      payslip.createdAt ||
      payslip.updatedAt;

    return {
      ...payslip,
      id: payslip._id || payslip.id,
      month: formatMonth(month),
      basicSalary: formatCurrency(basicSalary),
      allowances: formatCurrency(allowances),
      deductions: formatCurrency(deductions),
      netSalary: formatCurrency(netSalary),
      generatedOn: formatDate(generatedOn),
      status: payslip.status || "Generated",
      rawBasicSalary: basicSalary,
      rawAllowances: allowances,
      rawDeductions: deductions,
      rawNetSalary: netSalary,
    };
  };

  const extractPayslips = (response) => {
    const payload = response?.data;

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.data?.payslips)) {
      return payload.data.payslips;
    }

    if (Array.isArray(payload?.payslips)) {
      return payload.payslips;
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return [];
  };

  const fetchPayslips = async () => {
    try {
      const response = await API.get("/payroll/my", authConfig);

      const data = response?.data;

      const user =
        data?.data?.employee ||
        data?.data?.user ||
        data?.employee ||
        data?.user;

      if (user) {
        setEmployee({
          name:
            user.name ||
            user.fullName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          employeeId: user.employeeId || user.empId || user.employeeID || "",
          department: getNestedValue(user.department, ""),
          designation: user.designation || user.jobTitle || user.position || "",
        });
      }

      const records = extractPayslips(response);

      const normalized = records.map(normalizePayslip).sort((a, b) => {
        const dateA = new Date(
          a.generatedOn || a.createdAt || a.month,
        ).getTime();

        const dateB = new Date(
          b.generatedOn || b.createdAt || b.month,
        ).getTime();

        if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
          return dateB - dateA;
        }

        return 0;
      });

      setPayslips(normalized);
    } catch (error) {
      console.error(
        "Failed to fetch payslips:",
        error?.response?.data || error.message,
      );
      setPayslips([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayslips();
    }
  }, [token]);

  const fetchPayslipDetails = async (payslip) => {
    if (!payslip?.id) {
      setSelectedPayslip(payslip);
      return;
    }

    try {
      const response = await API.get(
        `/payroll/payslips/${payslip.id}`,
        authConfig,
      );

      const data = response?.data;

      const details =
        data?.data?.payslip || data?.data || data?.payslip || data;

      if (details && typeof details === "object") {
        setSelectedPayslip({
          ...payslip,
          ...normalizePayslip(details),
        });
      } else {
        setSelectedPayslip(payslip);
      }
    } catch (error) {
      console.error(
        "Failed to fetch payslip details:",
        error?.response?.data || error.message,
      );

      setSelectedPayslip(payslip);
    }
  };

  const latestPayslip = payslips[0] || {
    month: "--",
    basicSalary: "₹0",
    allowances: "₹0",
    deductions: "₹0",
    netSalary: "₹0",
    generatedOn: "--",
    status: "Generated",
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section>
        <p className="text-sm font-medium text-blue-600">Payslips</p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Payslips
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View and download your monthly salary payslips.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Latest Net Salary"
          value={latestPayslip.netSalary}
          subtitle={latestPayslip.month}
          icon={WalletCards}
        />

        <SummaryCard
          title="Basic Salary"
          value={latestPayslip.basicSalary}
          subtitle="Monthly basic"
          icon={Receipt}
        />

        <SummaryCard
          title="Allowances"
          value={latestPayslip.allowances}
          subtitle="This month"
          icon={TrendingUp}
        />

        <SummaryCard
          title="Payslips"
          value={payslips.length}
          subtitle="Available documents"
          icon={FileText}
        />
      </section>

      {/* Latest Payslip */}
      <section className="overflow-hidden rounded-2xl bg-[#101C36] text-white">
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Receipt size={21} />
              </div>

              <div>
                <p className="text-base font-semibold">Latest Payslip</p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {latestPayslip.month}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs text-slate-400">Net Salary</p>

              <p className="mt-1 text-3xl font-bold">
                {latestPayslip.netSalary}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => fetchPayslipDetails(latestPayslip)}
              disabled={!payslips.length}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye size={17} />
              View Payslip
            </button>

            <button
              type="button"
              onClick={() => handleDownload(latestPayslip, token)}
              disabled={!payslips.length || !latestPayslip.id}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* Payslip History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Payslip History
          </h3>

          <p className="text-xs text-slate-500">
            Access your previous monthly payslips.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <TableHead>Month</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </thead>

            <tbody>
              {payslips.map((payslip) => (
                <tr
                  key={payslip.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CalendarDays size={17} />
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {payslip.month}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Generated {payslip.generatedOn || "--"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{payslip.basicSalary}</TableCell>

                  <TableCell>{payslip.allowances}</TableCell>

                  <TableCell>{payslip.deductions}</TableCell>

                  <TableCell>
                    <span className="font-semibold text-slate-800">
                      {payslip.netSalary}
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={payslip.status} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fetchPayslipDetails(payslip)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        title="View payslip"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(payslip, token)}
                        disabled={!payslip.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {payslips.length}
            </span>{" "}
            available payslips
          </p>
        </div>
      </section>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          employee={employee}
          token={token}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------- */
/* Summary Card */
/* -------------------------------------------------- */

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

/* -------------------------------------------------- */
/* Table */
/* -------------------------------------------------- */

const TableHead = ({ children }) => (
  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-5 py-4 text-sm text-slate-600">{children}</td>
);

/* -------------------------------------------------- */
/* Status */
/* -------------------------------------------------- */

const StatusBadge = ({ status }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 size={13} />
      {status}
    </span>
  );
};

/* -------------------------------------------------- */
/* Payslip Modal */
/* -------------------------------------------------- */

const PayslipModal = ({ payslip, employee, token, onClose }) => {
  const displayEmployee = {
    name:
      employee?.name ||
      payslip?.employeeName ||
      payslip?.employee?.name ||
      "Employee",
    employeeId:
      employee?.employeeId ||
      payslip?.employeeId ||
      payslip?.employee?.employeeId ||
      payslip?.employee?.empId ||
      "--",
    department:
      employee?.department ||
      payslip?.department ||
      payslip?.employee?.department?.title ||
      "--",
    designation:
      employee?.designation ||
      payslip?.designation ||
      payslip?.employee?.designation ||
      payslip?.employee?.jobTitle ||
      "--",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Payslip</h3>

            <p className="mt-0.5 text-xs text-slate-500">{payslip.month}</p>
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

        {/* Payslip */}
        <div className="p-5 sm:p-6">
          {/* Company Header */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">HRMS</h4>

              <p className="mt-1 text-xs text-slate-500">
                Human Resource Management System
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">Payslip</p>

              <p className="mt-1 font-semibold text-slate-900">
                {payslip.month}
              </p>
            </div>
          </div>

          {/* Employee */}
          <div className="grid grid-cols-1 gap-4 border-b border-slate-200 py-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">Employee Name</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {displayEmployee.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Employee ID</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {displayEmployee.employeeId}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Department</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {displayEmployee.department}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Designation</p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {displayEmployee.designation}
              </p>
            </div>
          </div>

          {/* Salary */}
          <div className="py-5">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Salary Details
            </h4>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-600">Basic Salary</span>

                <span className="text-sm font-medium text-slate-800">
                  {payslip.basicSalary}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-600">Allowances</span>

                <span className="text-sm font-medium text-slate-800">
                  {payslip.allowances}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm text-slate-600">Deductions</span>

                <span className="text-sm font-medium text-red-600">
                  - {payslip.deductions}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 px-4 py-4">
                <span className="text-sm font-semibold text-slate-900">
                  Net Salary
                </span>

                <span className="text-lg font-bold text-blue-600">
                  {payslip.netSalary}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />

              <p className="text-sm font-medium text-emerald-700">
                Payslip generated successfully
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Printer size={17} />
              Print
            </button>

            <button
              type="button"
              onClick={() => handleDownload(payslip, token)}
              disabled={!payslip.id}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={17} />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------- */
/* Backend PDF Download */
/* -------------------------------------------------- */

const handleDownload = async (payslip, token) => {
  if (!payslip?.id || !token) return;

  try {
    const response = await API.get(`/payroll/payslips/${payslip.id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers?.["content-type"] || "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `Payslip-${(payslip.month || "Payslip")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Failed to download payslip PDF:",
      error?.response?.data || error.message,
    );
  }
};

export default EmpPayslipScreen;
