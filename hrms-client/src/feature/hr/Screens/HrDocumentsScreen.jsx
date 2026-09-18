import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Download,
  Eye,
  Upload,
  X,
  Users,
  CheckCircle2,
  Clock3,
  FileCheck2,
} from "lucide-react";
import { API } from "../../../Core/url";
import { errorMsgApi } from "../../../Core/toasts";

const DOCUMENT_TYPES = [
  { value: "offer-joining", label: "Employment" },
  { value: "id-proof", label: "Identity" },
  { value: "certificate", label: "Education" },
  { value: "other", label: "Financial" },
  { value: "resume", label: "Employment" },
  { value: "experience-letter", label: "Employment" },
  { value: "profile-photo", label: "Identity" },
];

const getDocumentTypeLabel = (type) => {
  const match = DOCUMENT_TYPES.find((item) => item.value === type);
  return match?.label || "Other";
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes === 0) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
};

const getEmployeeName = (employee) =>
  employee?.name ||
  `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
  "Unknown Employee";

const getDepartmentName = (employee) =>
  typeof employee?.department === "object"
    ? employee?.department?.title || "-"
    : employee?.department || "-";

const HrDocumentsScreen = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [uploadEmployee, setUploadEmployee] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);

  const [localVerifiedDocuments, setLocalVerifiedDocuments] = useState(
    new Set(),
  );

  const handleExport = async () => {
    try {
      const params = { export: "csv" };
      if (search) params.search = search;
      if (typeFilter !== "All Types") {
        // Map display type to backend documentType values
        const typeMap = {
          Employment: "offer-joining",
          Identity: "id-proof",
          Education: "certificate",
          Financial: "other",
        };
        params.documentType = typeMap[typeFilter];
      }
      if (statusFilter !== "All Status") {
        params.status = statusFilter.toLowerCase();
      }

      const response = await API.get("/reports/employees", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `documents-report-${Date.now()}.csv`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      errorMsgApi(error?.response?.data?.message || "Failed to export documents");
    }
  };

  useEffect(() => {
    loadDocuments();
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await API.get("/employees", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      setEmployees(response?.data?.data || []);
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to fetch employees",
      );
    }
  };

  const loadDocuments = async () => {
    try {
      const employeeResponse = await API.get("/employees", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const employeeList = employeeResponse?.data?.data || [];

      if (employeeList.length === 0) {
        setDocuments([]);
        return;
      }

      const documentResponses = await Promise.all(
        employeeList.map(async (employee) => {
          try {
            const response = await API.get(
              `/documents/employee/${employee._id}`,
            );

            return {
              employee,
              documents: response?.data?.data || [],
            };
          } catch {
            return {
              employee,
              documents: [],
            };
          }
        }),
      );

      const formattedDocuments = documentResponses.flatMap(
        ({ employee, documents: employeeDocuments }) =>
          employeeDocuments.map((document) => ({
            id: document._id,
            employee: getEmployeeName(employee),
            employeeId: employee?.empId || "-",
            department: getDepartmentName(employee),
            document: document?.documentName || document?.originalName || "-",
            type: getDocumentTypeLabel(document?.documentType),
            documentType: document?.documentType || "other",
            uploadedOn: formatDate(document?.createdAt),
            status:
              document?.approved === true ? "Verified" : "Pending",
            size: formatFileSize(document?.size),
            originalName: document?.originalName || "-",
            mimeType: document?.mimeType || "",
            userId: employee?._id,
            raw: document,
          })),
      );

      setDocuments(formattedDocuments);
    } catch (error) {
      setDocuments([]);
      errorMsgApi(
        error?.response?.data?.message || "Failed to fetch documents",
      );
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const effectiveStatus = localVerifiedDocuments.has(doc.id)
        ? "Verified"
        : doc.status;

      const matchesSearch =
        doc.employee.toLowerCase().includes(search.toLowerCase()) ||
        doc.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        doc.document.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All Types" || doc.type === typeFilter;

      const matchesStatus =
        statusFilter === "All Status" || effectiveStatus === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [
    documents,
    search,
    typeFilter,
    statusFilter,
    localVerifiedDocuments,
  ]);

  const getEffectiveStatus = (document) =>
    localVerifiedDocuments.has(document.id)
      ? "Verified"
      : document.status;

  const totalDocuments = documents.length;

  const verifiedDocuments = documents.filter(
    (doc) => getEffectiveStatus(doc) === "Verified",
  ).length;

  const pendingDocuments = documents.filter(
    (doc) => getEffectiveStatus(doc) === "Pending",
  ).length;

  const uniqueEmployees = new Set(
    documents.map((doc) => doc.employeeId),
  ).size;

  const verifyDocument = (id) => {
    setLocalVerifiedDocuments((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: "Verified" } : doc,
      ),
    );
  };

  const handleDownload = async (document) => {
    try {
      const response = await API.get(
        `/documents/${document.id}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: document.mimeType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.originalName || document.document;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to download document",
      );
    }
  };

  const handleUpload = async () => {
    if (!uploadEmployee || !uploadType || !uploadFile) {
      errorMsgApi("Employee, document type and file are required");
      return;
    }

    const formData = new FormData();

    formData.append("userId", uploadEmployee);
    formData.append("documentType", uploadType);
    formData.append(
      "documentName",
      uploadName.trim() || uploadFile.name,
    );
    formData.append("file", uploadFile);

    try {
      await API.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadEmployee("");
      setUploadType("");
      setUploadName("");
      setUploadFile(null);
      setShowUploadModal(false);

      await loadDocuments();
    } catch (error) {
      errorMsgApi(
        error?.response?.data?.message || "Failed to upload document",
      );
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Verified") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Documents Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage and verify employee documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Upload size={17} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Documents"
          value={totalDocuments}
          icon={<FileText size={20} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Verified"
          value={verifiedDocuments}
          icon={<CheckCircle2 size={20} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryCard
          title="Pending Verification"
          value={pendingDocuments}
          icon={<Clock3 size={20} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Employees"
          value={uniqueEmployees}
          icon={<Users size={20} />}
          iconClass="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search employee or document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option>All Types</option>
            <option>Employment</option>
            <option>Identity</option>
            <option>Education</option>
            <option>Financial</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option>All Status</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              Employee Documents
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {filteredDocuments.length} documents found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Document
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Uploaded
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => {
                  const status = getEffectiveStatus(doc);

                  return (
                    <tr
                      key={doc.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {doc.employee
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {doc.employee}
                            </p>

                            <p className="text-xs text-slate-500">
                              {doc.employeeId} • {doc.department}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <FileText size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {doc.document}
                            </p>

                            <p className="text-xs text-slate-400">
                              {doc.size}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {doc.type}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {doc.uploadedOn}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedDocument(doc)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleDownload(doc)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>

                          {status === "Pending" && (
                            <button
                              onClick={() => verifyDocument(doc.id)}
                              className="rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Verify
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Document Details
                </h3>

                <p className="text-xs text-slate-500">
                  {selectedDocument.document}
                </p>
              </div>

              <button
                onClick={() => setSelectedDocument(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileCheck2 size={24} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedDocument.document}
                  </p>

                  <p className="text-sm text-slate-500">
                    {selectedDocument.size}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Employee"
                  value={selectedDocument.employee}
                />

                <InfoItem
                  label="Employee ID"
                  value={selectedDocument.employeeId}
                />

                <InfoItem
                  label="Department"
                  value={selectedDocument.department}
                />

                <InfoItem
                  label="Type"
                  value={selectedDocument.type}
                />

                <InfoItem
                  label="Uploaded On"
                  value={selectedDocument.uploadedOn}
                />

                <InfoItem
                  label="Status"
                  value={getEffectiveStatus(selectedDocument)}
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  onClick={() => handleDownload(selectedDocument)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  Upload Document
                </h3>

                <p className="text-xs text-slate-500">
                  Upload an employee document
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Employee
                </label>

                <select
                  value={uploadEmployee}
                  onChange={(e) => setUploadEmployee(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select employee</option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {getEmployeeName(employee)}{" "}
                      {employee?.empId ? `(${employee.empId})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Document Type
                </label>

                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select document type</option>
                  <option value="offer-joining">Employment</option>
                  <option value="id-proof">Identity</option>
                  <option value="certificate">Education</option>
                  <option value="other">Financial</option>
                  <option value="resume">Resume</option>
                  <option value="experience-letter">
                    Experience Letter
                  </option>
                  <option value="profile-photo">Profile Photo</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Document Name
                </label>

                <input
                  type="text"
                  placeholder="Enter document name"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  File
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/30">
                  <Upload size={24} className="mb-2 text-slate-400" />

                  <span className="text-sm font-medium text-slate-700">
                    {uploadFile ? uploadFile.name : "Click to upload"}
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    PDF, JPG or PNG
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) =>
                      setUploadFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Upload size={16} />
                  Upload
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

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </p>
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

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
};

export default HrDocumentsScreen;
