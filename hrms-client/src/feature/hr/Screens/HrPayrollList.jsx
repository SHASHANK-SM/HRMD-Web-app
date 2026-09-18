import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "../../../Core/url";
import { errorMsgApi, successfully } from "../../../Core/toasts";
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
  Plus,
  Trash2,
} from "lucide-react";

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const parseAmount = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(String(value).trim().replace(/,/g, ""));
  return Number.isFinite(number) && number >= 0 ? roundMoney(number) : null;
};

const formatCurrency = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "₹0";
  const hasDecimals = Math.abs(number % 1) > 0.0001;
  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

const calculatePayroll = (form) => {
  const annualCtc = parseAmount(form.annualCtc);
  const basicSalary = parseAmount(form.basicSalary);
  const employerPf = parseAmount(form.employerPf);
  const employeePf = parseAmount(form.employeePf);
  const professionalTax = parseAmount(form.professionalTax);
  const monthlyCtc = annualCtc === null ? null : roundMoney(annualCtc / 12);
  const otherAllowances =
    monthlyCtc === null || basicSalary === null || employerPf === null
      ? null
      : roundMoney(Math.max(0, monthlyCtc - basicSalary - employerPf));
  const grossSalary =
    basicSalary === null || otherAllowances === null
      ? null
      : roundMoney(basicSalary + otherAllowances);
  const netPay =
    grossSalary === null || employeePf === null || professionalTax === null
      ? null
      : roundMoney(Math.max(0, grossSalary - employeePf - professionalTax));

  return {
    annualCtc,
    monthlyCtc,
    basicSalary,
    employerPf,
    employeePf,
    professionalTax,
    otherAllowances,
    grossSalary,
    netPay,
  };
};

const getBreakdown = (payroll) => ({
  monthlyCtc: Number(payroll.monthlyCtc || payroll.totalEarnings || payroll.grossSalary || 0),
  annualCtc: Number(payroll.annualCtc || (payroll.monthlyCtc || payroll.totalEarnings || payroll.grossSalary || 0) * 12),
  basicSalary: Number(payroll.basicSalary || payroll.baseSalary || 0),
  employerPf: Number(payroll.employerPf || 0),
  otherAllowances: Number(payroll.otherAllowances || Math.max(0, Number(payroll.grossSalary || payroll.totalEarnings || 0) - Number(payroll.basicSalary || payroll.baseSalary || 0))),
  grossSalary: Number(payroll.grossSalary || payroll.totalEarnings || 0),
  employeePf: Number(payroll.employeePf || payroll.pf || 0),
  professionalTax: Number(payroll.professionalTax || 0),
  netPay: Number(payroll.netPay || payroll.netSalary || 0),
});

const normalizePayroll = (record) => {
  const breakdown = getBreakdown(record);
  return {
    id: record._id,
    employee: record.empId?.name || "-",
    employeeId: record.empId?.empId || record.empId || "-",
    department: record.empId?.department?.title || "-",
    designation: record.empId?.jobTitle || "-",
    month: `${record.month || "-"} ${record.year || ""}`.trim(),
    ...breakdown,
    allowances: breakdown.otherAllowances,
    deductions: Number(record.totalDeduction || breakdown.employeePf + breakdown.professionalTax),
    netSalary: breakdown.netPay,
    status: String(record.status || "pending").replace(/^./, (letter) =>
      letter.toUpperCase(),
    ),
  };
};

const HrPayrollList = () => {
  const { token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleExport = async () => {
    if (!token) return;
    try {
      const params = { export: "csv" };
      if (search) params.search = search;
      if (department !== "All Departments") params.department = department;
      if (status !== "All Status") params.status = status.toLowerCase();

      const response = await API.get("/reports/payroll", {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `payroll-report-${Date.now()}.csv`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      errorMsgApi(error?.response?.data?.message || "Failed to export payroll");
    }
  };

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [processForm, setProcessForm] = useState({
    month: "",
    year: new Date().getFullYear().toString(),
    employeeIds: [],
    annualCtc: "",
    basicSalary: "",
    employerPf: "",
    employeePf: "",
    professionalTax: "",
  });

  useEffect(() => {
    if (!token) return;
    const fetchEmployees = async () => {
      try {
        const response = await API.get("/employees", {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 200 },
        });
        setEmployees(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();
  }, [token]);

  const handleProcessPayroll = async (e) => {
    e.preventDefault();
    if (!token || processing) return;

    if (!processForm.month || processForm.employeeIds.length === 0) {
      errorMsgApi("Please select month and at least one employee");
      return;
    }

    const breakdown = calculatePayroll(processForm);
    if (
      breakdown.annualCtc === null ||
      breakdown.basicSalary === null ||
      breakdown.employerPf === null ||
      breakdown.employeePf === null ||
      breakdown.professionalTax === null
    ) {
      errorMsgApi("Enter valid non-negative values for CTC, basic salary, PF and professional tax");
      return;
    }

    setProcessing(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const empId of processForm.employeeIds) {
        try {
          const employee = employees.find((e) => e._id === empId);
          if (!employee) continue;

          const payload = {
            empId,
            month: processForm.month,
            year: parseInt(processForm.year) || new Date().getFullYear(),
            annualCtc: breakdown.annualCtc,
            basicSalary: breakdown.basicSalary,
            employerPf: breakdown.employerPf,
            employeePf: breakdown.employeePf,
            professionalTax: breakdown.professionalTax,
            calendarDays: 0,
            paidDays: 0,
            lossDays: 0,
          };

          await API.post("/payroll", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`Failed to process payroll for ${empId}:`, err);
        }
      }

      errorMsgApi(
        `Payroll processed: ${successCount} success, ${failCount} failed`,
        failCount > 0 ? "error" : "success"
      );

      setShowProcessModal(false);
      setProcessForm({
        month: "",
        year: new Date().getFullYear().toString(),
        employeeIds: [],
        annualCtc: "",
        basicSalary: "",
        employerPf: "",
        employeePf: "",
        professionalTax: "",
      });

      // Refresh the payroll list
      const response = await API.get("/payroll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = response?.data?.data || [];
      setPayrolls(
        records.map((record) => {
          const monthlyCtc = Number(record.monthlyCtc ?? record.totalEarnings ?? record.grossSalary ?? 0);
          return {
            id: record._id,
            employee: record.empId?.name || "-",
            employeeId: record.empId?.empId || record.empId || "-",
            department: record.empId?.department?.title || "-",
            designation: record.empId?.jobTitle || "-",
            month: `${record.month || "-"} ${record.year || ""}`.trim(),
            monthlyCtc,
            annualCtc: Number(record.annualCtc ?? monthlyCtc * 12),
            basic: Number(record.basicSalary ?? record.baseSalary ?? 0),
            employerPf: Number(record.employerPf ?? 0),
            employeePf: Number(record.employeePf ?? record.pf ?? 0),
            professionalTax: Number(record.professionalTax ?? 0),
            otherAllowances: Number(record.otherAllowances ?? Math.max(0, Number(record.grossSalary ?? record.totalEarnings ?? 0) - Number(record.basicSalary ?? record.baseSalary ?? 0))),
            grossSalary: Number(record.grossSalary ?? record.totalEarnings ?? 0),
            allowances:
              Number(record.otherAllowances ?? Math.max(0, Number(record.grossSalary ?? record.totalEarnings ?? 0) - Number(record.basicSalary ?? record.baseSalary ?? 0))),
            deductions: Number(record.totalDeduction ?? 0),
            netSalary: Number(record.netPay ?? record.netSalary ?? 0),
            status: String(record.status || "pending").replace(/^./, (letter) =>
              letter.toUpperCase(),
            ),
          };
        }),
      );
    } catch (error) {
      errorMsgApi(error?.response?.data?.message || "Failed to process payroll");
    } finally {
      setProcessing(false);
    }
  };

  const [payrolls, setPayrolls] = useState([]);
  const payrollBreakdown = useMemo(
    () => calculatePayroll(processForm),
    [processForm],
  );

  useEffect(() => {
    if (!token) return;
    API.get("/payroll", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const records = response?.data?.data || [];
        setPayrolls(records.map(normalizePayroll));
      })
      .catch((error) => console.error("Failed to fetch payroll:", error));
  }, [token]);

  const handleDeletePayroll = async (payroll) => {
    if (!token || deletingId || !window.confirm("Delete this payroll record?")) {
      return;
    }

    setDeletingId(payroll.id);
    try {
      await API.delete(`/payroll/${payroll.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await API.get("/payroll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayrolls((response?.data?.data || []).map(normalizePayroll));
      setActiveMenuId(null);
      successfully("Payroll deleted successfully");
    } catch (error) {
      errorMsgApi(error?.response?.data?.message || "Failed to delete payroll");
    } finally {
      setDeletingId(null);
    }
  };

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
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            onClick={() => setShowProcessModal(true)}
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
          value={formatCurrency(totalPayroll)}
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
                      {formatCurrency(payroll.basic)}
                    </td>

                    {/* ALLOWANCES */}
                    <td className="px-4 py-4 text-xs text-emerald-600">
                      +{formatCurrency(payroll.allowances)}
                    </td>

                    {/* DEDUCTIONS */}
                    <td className="px-4 py-4 text-xs text-red-500">
                      -{formatCurrency(payroll.deductions)}
                    </td>

                    {/* NET */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(payroll.netSalary)}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-4">
                      <PayrollStatus status={payroll.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4">
                      <div className="relative flex items-center gap-1">
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

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === payroll.id ? null : payroll.id,
                            )
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {activeMenuId === payroll.id && (
                          <button
                            type="button"
                            onClick={() => handleDeletePayroll(payroll)}
                            disabled={deletingId === payroll.id}
                            className="absolute right-0 top-9 z-20 flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-red-600 shadow-lg hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            {deletingId === payroll.id ? "Deleting..." : "Delete Payroll"}
                          </button>
                        )}
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

      {/* PROCESS PAYROLL MODAL */}
      {showProcessModal && (
        <ProcessPayrollModal
          employees={employees}
          onClose={() => setShowProcessModal(false)}
          onSubmit={handleProcessPayroll}
          processing={processing}
          form={processForm}
          setForm={setProcessForm}
          breakdown={payrollBreakdown}
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

const SalaryRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-600">{label}</span>
    <span
      className={`font-semibold ${
        tone === "positive"
          ? "text-emerald-600"
          : tone === "negative"
            ? "text-red-500"
            : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const formatBreakdownValue = (value) =>
  value === null || value === undefined ? "—" : formatCurrency(value);

const PayrollBreakdownSummary = ({ breakdown }) => (
  <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Salary Summary</h3>
      <div className="space-y-1.5">
        <SalaryRow label="Monthly CTC" value={formatBreakdownValue(breakdown.monthlyCtc)} />
        <SalaryRow label="Annual CTC" value={formatBreakdownValue(breakdown.annualCtc)} />
        <SalaryRow label="Basic Salary" value={formatBreakdownValue(breakdown.basicSalary)} />
        <SalaryRow label="Employer PF" value={formatBreakdownValue(breakdown.employerPf)} />
        <SalaryRow label="Other Allowances" value={formatBreakdownValue(breakdown.otherAllowances)} />
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Earnings</h3>
      <div className="space-y-1.5">
        <SalaryRow label="Basic Salary" value={formatBreakdownValue(breakdown.basicSalary)} />
        <SalaryRow label="Other Allowances" value={formatBreakdownValue(breakdown.otherAllowances)} />
        <SalaryRow label="Gross Salary" value={formatBreakdownValue(breakdown.grossSalary)} />
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Deductions</h3>
      <div className="space-y-1.5">
        <SalaryRow label="Employee PF" value={formatBreakdownValue(breakdown.employeePf)} tone="negative" />
        <SalaryRow label="Professional Tax" value={formatBreakdownValue(breakdown.professionalTax)} tone="negative" />
      </div>
    </div>

    <div className="pt-2 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Final Salary</h3>
      <div className="space-y-1.5">
        <SalaryRow label="Net Pay" value={formatBreakdownValue(breakdown.netPay)} />
        <SalaryRow label="Monthly CTC" value={formatBreakdownValue(breakdown.monthlyCtc)} />
        <SalaryRow label="Annual CTC" value={formatBreakdownValue(breakdown.annualCtc)} />
      </div>
    </div>
  </div>
);

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
  const breakdown = getBreakdown(payroll);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
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
          <PayrollBreakdownSummary breakdown={breakdown} />
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
   PROCESS PAYROLL MODAL
========================================================= */

const ProcessPayrollModal = ({
  employees,
  onClose,
  onSubmit,
  processing,
  form,
  setForm,
  breakdown,
}) => {
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Process Payroll</h2>
            <p className="text-xs text-slate-400 mt-1">Create payroll records for selected employees</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Month *</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="">Select month</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m.toLowerCase()}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Year *</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="2020"
                max="2030"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Monthly CTC</label>
              <input
                type="number"
                value={breakdown.monthlyCtc ?? ""}
                readOnly
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Annual CTC *</label>
              <input
                type="number"
                value={form.annualCtc}
                onChange={(e) => setForm({ ...form, annualCtc: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Basic Salary *</label>
              <input
                type="number"
                value={form.basicSalary}
                onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Employer PF *</label>
              <input
                type="number"
                value={form.employerPf}
                onChange={(e) => setForm({ ...form, employerPf: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Employee PF *</label>
              <input
                type="number"
                value={form.employeePf}
                onChange={(e) => setForm({ ...form, employeePf: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Professional Tax *</label>
              <input
                type="number"
                value={form.professionalTax}
                onChange={(e) => setForm({ ...form, professionalTax: e.target.value })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <PayrollBreakdownSummary breakdown={breakdown} />

          {/* Employee Selection */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Employees *</label>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2">
              {employees.map((emp) => (
                <label key={emp._id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={emp._id}
                    checked={form.employeeIds.includes(emp._id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        employeeIds: e.target.checked
                          ? [...form.employeeIds, emp._id]
                          : form.employeeIds.filter((id) => id !== emp._id),
                      })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">
                    {emp.name} ({emp.empId}) - {emp.jobTitle || emp.designation || "-"}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {form.employeeIds.length} employee(s) selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : "Process Payroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HrPayrollList;
