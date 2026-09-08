import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Users,
  Download,
  X,
} from "lucide-react";
import { API } from "../../../Core/url";
import { errorMsgApi } from "../../../Core/toasts";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  employeeId: "",
  joiningDate: "",
  department: "",
  designation: "",
  employmentType: "",
  role: "Employee",
  username: "",
  password: "",
};

const getEmployeeName = (employee) => {
  if (employee?.name) return employee.name;

  return (
    `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() || "-"
  );
};

const getDepartmentName = (employee) => {
  if (typeof employee?.department === "object") {
    return employee?.department?.title || "-";
  }

  return employee?.department || "-";
};

const getEmploymentType = (value) => {
  if (!value) return "-";

  const normalized = String(value).toLowerCase();

  if (normalized === "fulltime" || normalized === "full time") {
    return "Full Time";
  }

  if (normalized === "parttime" || normalized === "part time") {
    return "Part Time";
  }

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toInputDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const normalizeEmployee = (employee) => ({
  ...employee,
  id: employee?.empId || employee?._id,
  name: getEmployeeName(employee),
  email: employee?.email || "-",
  phone: employee?.mobile || employee?.phone || "-",
  department: getDepartmentName(employee),
  designation: employee?.designation || employee?.jobTitle || "-",
  joiningDate: formatDate(
    employee?.joinDate ||
      employee?.joiningDate ||
      employee?.jobTimeline?.[0]?.effectiveDate,
  ),
  employmentType: getEmploymentType(employee?.employmentType),
  status:
    String(
      employee?.empStatus || employee?.status || "active",
    ).toLowerCase() === "active"
      ? "Active"
      : "Inactive",
});

const HrEmployeeManagentScreen = () => {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const loadDepartments = async () => {
    try {
      const response = await API.get("/employees/departments/list");

      setDepartments(response?.data?.data || []);
    } catch (error) {
      setDepartments([]);
      errorMsgApi(
        error?.response?.data?.message || "Failed to fetch departments",
      );
    }
  };

  const loadEmployees = async () => {
    setIsLoading(true);

    try {
      const params = {
        page,
        limit: 10,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (department !== "All Departments") {
        const selectedDepartment = departments.find(
          (item) => item?.title === department,
        );

        if (selectedDepartment?._id) {
          params.department = selectedDepartment._id;
        } else {
          params.department = department;
        }
      }

      if (status !== "All Status") {
        params.status = status.toLowerCase();
      }

      const response = await API.get("/employees", { params });

      const apiEmployees = response?.data?.data || [];
      const meta = response?.data?.meta || {};

      setEmployees(apiEmployees.map(normalizeEmployee));
      setTotalEmployees(Number(meta?.total || 0));
      setTotalPages(Math.max(Number(meta?.totalPages || 1), 1));
    } catch (error) {
      setEmployees([]);
      setTotalEmployees(0);
      setTotalPages(1);

      errorMsgApi(
        error?.response?.data?.message || "Failed to fetch employees",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 350);

    return () => clearTimeout(timer);
  }, [page, search, department, status, departments, loadEmployees]);

  useEffect(() => {
    setPage(1);
  }, [search, department, status]);

  const filteredEmployees = useMemo(() => employees, [employees]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive",
  ).length;

  const newThisMonth = employees.filter((employee) => {
    if (!employee.joiningDate || employee.joiningDate === "-") {
      return false;
    }

    const date = new Date(employee.joiningDate);

    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalActiveFromApi =
    status === "All Status"
      ? Math.max(activeEmployees, totalEmployees - inactiveEmployees)
      : activeEmployees;

  const totalInactiveFromApi =
    status === "All Status"
      ? Math.max(inactiveEmployees, 0)
      : inactiveEmployees;

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleStatusChange = async (employee) => {
    const nextStatus = employee.status === "Active" ? "inactive" : "active";

    try {
      await API.patch(`/employees/${employee.id}/status`, {
        status: nextStatus,
      });

      await loadEmployees();

      if (selectedEmployee && selectedEmployee.id === employee.id) {
        setSelectedEmployee((prev) =>
          prev
            ? {
                ...prev,
                status: nextStatus === "active" ? "Active" : "Inactive",
              }
            : prev,
        );
      }
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to update employee status",
      );
    }
  };

  const handleExport = async () => {
    try {
      const response = await API.get("/reports/employees", {
        params: {
          export: "csv",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = "employees-report.csv";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to export employees",
      );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Employee Management
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's employees and workforce information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            <Plus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={Users}
          label="Total Employees"
          value={totalEmployees}
          color="blue"
        />

        <SummaryCard
          icon={UserCheck}
          label="Active"
          value={totalActiveFromApi}
          color="emerald"
        />

        <SummaryCard
          icon={UserX}
          label="Inactive"
          value={totalInactiveFromApi}
          color="red"
        />

        <SummaryCard
          icon={Plus}
          label="New This Month"
          value={newThisMonth}
          color="violet"
        />
      </div>

      {/* Employee Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">All Employees</h2>

              <p className="text-xs text-slate-400 mt-1">
                {totalEmployees} employees found
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

          {/* Search + Filters */}
          <div
            className={`mt-4 ${
              showFilters ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row gap-3`}
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search by name, employee ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Department */}
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Departments</option>

              {departments.map((item) => (
                <option key={item._id} value={item.title}>
                  {item.title}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:border-blue-400"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <TableHeading>Employee</TableHeading>
                <TableHeading>Department</TableHeading>
                <TableHeading>Designation</TableHeading>
                <TableHeading>Joining Date</TableHeading>
                <TableHeading>Employment</TableHeading>
                <TableHeading>Status</TableHeading>
                <TableHeading>Action</TableHeading>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    {/* Employee */}
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={employee.name} />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {employee.name}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">
                        {employee.department}
                      </span>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">
                        {employee.designation}
                      </span>
                    </td>

                    {/* Joining Date */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-500">
                        {employee.joiningDate}
                      </span>
                    </td>

                    {/* Employment */}
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-600">
                        {employee.employmentType}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <StatusBadge status={employee.status} />
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View"
                          onClick={() => setSelectedEmployee(employee)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(employee)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title={
                            employee.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() => handleStatusChange(employee)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          {employee.status === "Active" ? (
                            <MoreHorizontal size={17} />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <Users size={20} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-700">
                        {isLoading
                          ? "Loading employees..."
                          : "No employees found"}
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
              {totalEmployees === 0 ? 0 : (page - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-600">
              {Math.min(page * 10, totalEmployees)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-600">{totalEmployees}</span>{" "}
            employees
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => {
              let pageNumber;

              if (totalPages <= 3) {
                pageNumber = index + 1;
              } else if (page <= 2) {
                pageNumber = index + 1;
              } else if (page >= totalPages - 1) {
                pageNumber = totalPages - 2 + index;
              } else {
                pageNumber = page - 1 + index;
              }

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    page === pageNumber
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Employee Modal */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          employee={editingEmployee}
          departments={departments}
          onClose={() => {
            setShowAddModal(false);
            setEditingEmployee(null);
          }}
          onSuccess={async () => {
            setShowAddModal(false);
            setEditingEmployee(null);
            await loadEmployees();
          }}
          onDepartmentsChange={loadDepartments}
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
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
    },
    violet: {
      bg: "bg-violet-50",
      icon: "text-violet-600",
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div
        className={`w-9 h-9 rounded-lg ${styles[color].bg} flex items-center justify-center`}
      >
        <Icon size={18} className={styles[color].icon} />
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
  const initials = String(name || "-")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
        active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      {status}
    </span>
  );
};

/* =========================================================
   VIEW EMPLOYEE MODAL
========================================================= */

const EmployeeModal = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Employee Details</h2>

            <p className="text-xs text-slate-400 mt-1">Employee information</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile */}
        <div className="p-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              {employee.name
                .split(" ")
                .filter(Boolean)
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">{employee.name}</h3>

              <p className="text-xs text-slate-400 mt-1">{employee.id}</p>

              <div className="mt-2">
                <StatusBadge status={employee.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <Detail label="Department" value={employee.department} />

            <Detail label="Designation" value={employee.designation} />

            <Detail label="Joining Date" value={employee.joiningDate} />

            <Detail label="Employment Type" value={employee.employmentType} />

            <Detail label="Email" value={employee.email} icon={Mail} />

            <Detail label="Phone" value={employee.phone} icon={Phone} />
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DETAIL
========================================================= */

const Detail = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <div className="flex items-center gap-2 mt-1">
      {Icon && <Icon size={14} className="text-slate-400" />}

      <p className="text-sm text-slate-700">{value || "-"}</p>
    </div>
  </div>
);

/* =========================================================
   ADD / EDIT EMPLOYEE MODAL
========================================================= */

const AddEmployeeModal = ({
  employee,
  departments,
  onClose,
  onSuccess,
  onDepartmentsChange,
}) => {
  const isEdit = Boolean(employee);

  const [form, setForm] = useState(() => {
    if (!employee) {
      return EMPTY_FORM;
    }

    return {
      firstName: employee?.name?.split(" ")[0] || "",
      lastName: employee?.name?.split(" ").slice(1).join(" ") || "",
      email: employee?.email === "-" ? "" : employee?.email || "",
      phone: employee?.phone === "-" ? "" : employee?.phone || "",
      employeeId: employee?.id || "",
      joiningDate: toInputDate(
        employee?.raw?.joinDate || employee?.raw?.joiningDate,
      ),
      department: employee?.raw?.department?._id || "",
      designation: employee?.raw?.designation || employee?.raw?.jobTitle || "",
      employmentType: employee?.raw?.employmentType || "",
      role: employee?.raw?.role === "manager" ? "Manager" : "Employee",
      username: employee?.raw?.username || "",
      password: "",
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDepartment = async () => {
    const title = newDepartment.trim();
    if (!title) return;

    setIsAddingDepartment(true);

    try {
      const response = await API.post("/employees/departments", { title });

      const created = response?.data?.data;

      if (created?._id) {
        setForm((prev) => ({
          ...prev,
          department: created._id,
        }));
      }

      setNewDepartment("");

      if (onDepartmentsChange) {
        await onDepartmentsChange();
      }
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to create department",
      );
    } finally {
      setIsAddingDepartment(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.employeeId.trim()
    ) {
      errorMsgApi("First name, email, phone and employee ID are required");
      return;
    }

    if (!isEdit && !form.department) {
      errorMsgApi("Department is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDepartment = departments.find(
        (item) => item?._id === form.department,
      );

      const payload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.phone.trim(),
        empId: form.employeeId.trim(),
        jobTitle: form.designation.trim(),
        department: selectedDepartment?._id || form.department || undefined,
        joinDate: form.joiningDate || undefined,
        employmentType: form.employmentType || undefined,
      };

      if (!isEdit) {
        payload.password = form.password.trim();

        payload.role = form.role === "Manager" ? "manager" : "employee";

        await API.post("/employees", payload);
      } else {
        await API.patch(`/employees/${employee.id}`, payload);
      }

      await onSuccess();
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message ||
          (isEdit ? "Failed to update employee" : "Failed to create employee"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {isEdit
                ? "Update employee information."
                : "Enter employee information to create a new record."}
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form className="p-5 space-y-5" onSubmit={handleSubmit}>
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                placeholder="Enter first name"
                value={form.firstName}
                onChange={(value) => handleChange("firstName", value)}
              />

              <FormInput
                label="Last Name"
                placeholder="Enter last name"
                value={form.lastName}
                onChange={(value) => handleChange("lastName", value)}
              />

              <FormInput
                label="Email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(value) => handleChange("email", value)}
              />

              <FormInput
                label="Phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(value) => handleChange("phone", value)}
              />
            </div>
          </FormSection>

          <FormSection title="Employment Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Employee ID"
                placeholder="EMP009"
                value={form.employeeId}
                onChange={(value) => handleChange("employeeId", value)}
                disabled={isEdit}
              />

              <FormInput
                label="Joining Date"
                type="date"
                value={form.joiningDate}
                onChange={(value) => handleChange("joiningDate", value)}
              />

              <FormSelect
                label="Department"
                value={form.department}
                onChange={(value) => handleChange("department", value)}
                options={departments.map((item) => ({
                  label: item.title,
                  value: item._id,
                }))}
              />

              {/* Add Department Inline */}
              <div className="sm:col-span-2">
                {departments.length === 0 && (
                  <p className="mb-2 text-xs text-amber-600">
                    No departments found. Create one below to assign this
                    employee.
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New department name"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    disabled={isAddingDepartment || !newDepartment.trim()}
                    className="shrink-0 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isAddingDepartment ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>

              <FormInput
                label="Designation"
                placeholder="Enter designation"
                value={form.designation}
                onChange={(value) => handleChange("designation", value)}
              />

              <FormSelect
                label="Employment Type"
                value={form.employmentType}
                onChange={(value) => handleChange("employmentType", value)}
                options={[
                  {
                    label: "Full Time",
                    value: "full-time",
                  },
                  {
                    label: "Part Time",
                    value: "part-time",
                  },
                  {
                    label: "Contract",
                    value: "contract",
                  },
                  {
                    label: "Intern",
                    value: "intern",
                  },
                ]}
              />

              <FormSelect
                label="Role"
                value={form.role}
                onChange={(value) => handleChange("role", value)}
                options={[
                  {
                    label: "Employee",
                    value: "Employee",
                  },
                  {
                    label: "Manager",
                    value: "Manager",
                  },
                ]}
              />
            </div>
          </FormSection>

          {!isEdit && (
            <FormSection title="Account Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Username"
                  placeholder="Enter username"
                  value={form.username}
                  onChange={(value) => handleChange("username", value)}
                />

                <FormInput
                  label="Temporary Password (optional)"
                  type="password"
                  placeholder="Optional"
                  value={form.password}
                  onChange={(value) => handleChange("password", value)}
                />
              </div>
            </FormSection>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Update Employee"
                  : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   FORM SECTION
========================================================= */

const FormSection = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>

    {children}
  </div>
);

/* =========================================================
   INPUT
========================================================= */

const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
}) => (
  <label className="block">
    <span className="block text-xs font-medium text-slate-600 mb-1.5">
      {label}
    </span>

    <input
      type={type}
      placeholder={placeholder}
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
    />
  </label>
);

/* =========================================================
   SELECT
========================================================= */

const FormSelect = ({ label, options, value, onChange }) => (
  <label className="block">
    <span className="block text-xs font-medium text-slate-600 mb-1.5">
      {label}
    </span>

    <select
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-blue-400"
    >
      <option value="">Select {label}</option>

      {options.map((option) => {
        const normalized =
          typeof option === "string"
            ? {
                label: option,
                value: option,
              }
            : option;

        return (
          <option key={normalized.value} value={normalized.value}>
            {normalized.label}
          </option>
        );
      })}
    </select>
  </label>
);

export default HrEmployeeManagentScreen;
