import { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock3,
  X,
  File,
  Search,
  AlertCircle,
} from "lucide-react";
import { API } from "../../../Core/url";

const EmployeeDocumentsScreen = () => {
  const fileInputRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [documentType, setDocumentType] = useState("Offer Letter");
  const [selectedFile, setSelectedFile] = useState(null);
  const [, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getErrorMessage = (error) =>
    error?.response?.data?.message || "Something went wrong. Please try again.";

  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || Number(bytes) <= 0) return "--";

    const kb = Number(bytes) / 1024;

    if (kb < 1024) {
      return `${Math.max(1, Math.round(kb))} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const normalizeDocument = (document) => {
    return {
      id: document?._id || document?.id,

      name:
        document?.name ||
        document?.documentName ||
        document?.title ||
        document?.type ||
        "Document",

      fileName:
        document?.fileName ||
        document?.originalName ||
        document?.originalFileName ||
        document?.filename ||
        "Document",

      type: document?.type || document?.documentType || "Other",

      uploadedOn: formatDate(
        document?.uploadedOn || document?.uploadedAt || document?.createdAt,
      ),

      size:
        document?.sizeFormatted ||
        (document?.size ? formatFileSize(document.size) : "--"),

      status: document?.status || "Pending",

      documentUrl:
        document?.url || document?.fileUrl || document?.documentUrl || null,
    };
  };

  const fetchDocuments = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await API.get("/documents/my", authConfig);

      const data = response?.data?.data ?? response?.data ?? [];

      const records = Array.isArray(data)
        ? data
        : data?.documents || data?.records || data?.results || [];

      setDocuments(records.map(normalizeDocument));
    } catch (error) {
      console.error("Failed to fetch documents:", error);

      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        document.name.toLowerCase().includes(search) ||
        document.fileName.toLowerCase().includes(search);

      const matchesType =
        selectedType === "All" || document.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [documents, searchTerm, selectedType]);

  const verifiedCount = documents.filter(
    (doc) => doc.status === "Verified",
  ).length;

  const pendingCount = documents.filter(
    (doc) => doc.status === "Pending",
  ).length;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG or PNG files are allowed.");

      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("File size must not exceed 5 MB.");

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !token || uploading) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("documentType", documentType);

      formData.append("document", selectedFile);

      if (selectedDocument) {
        await API.put(`/documents/${selectedDocument.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await API.post("/documents", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await fetchDocuments();

      setSelectedFile(null);
      setSelectedDocument(null);
      setDocumentType("Offer Letter");
      setShowUploadModal(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload document:", error);

      alert(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed || !token) return;

    try {
      await API.delete(`/documents/${documentId}`, authConfig);

      setDocuments((prev) =>
        prev.filter((document) => document.id !== documentId),
      );

      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        setShowViewModal(false);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);

      alert(getErrorMessage(error));
    }
  };

  const handleDownload = async (document) => {
    if (!document?.id || !token) return;

    try {
      const response = await API.get(`/documents/${document.id}/download`, {
        ...authConfig,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response?.headers?.["content-type"] || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.fileName || "document";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download document:", error);

      alert(getErrorMessage(error));
    }
  };

  const openViewModal = (document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setSelectedDocument(null);
    setDocumentType("Offer Letter");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Documents</p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Documents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload, view and manage your employment documents.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Upload size={17} />
            Upload Document
          </button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Documents"
          value={documents.length}
          subtitle="Uploaded documents"
          icon={FileText}
        />

        <SummaryCard
          title="Verified"
          value={verifiedCount}
          subtitle="Verified documents"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Pending Verification"
          value={pendingCount}
          subtitle="Awaiting verification"
          icon={Clock3}
        />
      </section>

      {/* Search & Filter */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search documents..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="All">All Document Types</option>
            <option value="Offer Letter">Offer Letter</option>
            <option value="Joining Letter">Joining Letter</option>
            <option value="Identity Proof">Identity Proof</option>
            <option value="Experience">Experience</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </section>

      {/* Documents Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">
            Document History
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage your uploaded employment documents.
          </p>
        </div>

        {filteredDocuments.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded On</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr
                      key={document.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">
                              {document.name}
                            </p>

                            <p className="mt-0.5 max-w-[250px] truncate text-xs text-slate-400">
                              {document.fileName}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{document.type}</TableCell>

                      <TableCell>{document.uploadedOn}</TableCell>

                      <TableCell>{document.size}</TableCell>

                      <TableCell>
                        <StatusBadge status={document.status} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ActionButton
                            icon={Eye}
                            label="View"
                            onClick={() => openViewModal(document)}
                          />

                          <ActionButton
                            icon={Download}
                            label="Download"
                            onClick={() => handleDownload(document)}
                          />

                          <ActionButton
                            icon={RefreshCw}
                            label="Replace"
                            onClick={() => {
                              setSelectedDocument(document);
                              setDocumentType(document.type);
                              setSelectedFile(null);
                              setShowUploadModal(true);
                            }}
                          />

                          <ActionButton
                            icon={Trash2}
                            label="Delete"
                            danger
                            onClick={() => handleDelete(document.id)}
                          />
                        </div>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {filteredDocuments.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {documents.length}
                </span>{" "}
                documents
              </p>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          title={selectedDocument ? "Replace Document" : "Upload Document"}
          onClose={closeUploadModal}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Document Type
              </label>

              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>Offer Letter</option>
                <option>Joining Letter</option>
                <option>Identity Proof</option>
                <option>Experience</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Select File
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Upload size={21} />
                </div>

                {selectedFile ? (
                  <>
                    <p className="mt-3 text-sm font-medium text-slate-800">
                      {selectedFile.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {Math.max(1, Math.round(selectedFile.size / 1024))} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Click to select a document
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      PDF, JPG or PNG files
                    </p>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />

              <p>Make sure the uploaded document is clear and readable.</p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeUploadModal}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedDocument ? "Replace Document" : "Upload Document"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <Modal
          title="Document Details"
          onClose={() => {
            setShowViewModal(false);
            setSelectedDocument(null);
          }}
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {selectedDocument.name}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {selectedDocument.fileName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Document Type" value={selectedDocument.type} />

              <DetailItem
                label="Uploaded On"
                value={selectedDocument.uploadedOn}
              />

              <DetailItem label="File Size" value={selectedDocument.size} />

              <DetailItem label="Status" value={selectedDocument.status} />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleDownload(selectedDocument)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  subtitle,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
}) => {
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
  const isVerified = status === "Verified";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isVerified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {isVerified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}

      {status}
    </span>
  );
};

const ActionButton = ({
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  label,
  onClick,
  danger = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <Icon size={16} />
    </button>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 p-3.5">
    <p className="text-xs text-slate-400">{label}</p>

    <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <File size={24} />
    </div>

    <h3 className="mt-4 text-sm font-semibold text-slate-800">
      No documents found
    </h3>

    <p className="mt-1 max-w-sm text-xs text-slate-500">
      Try changing your search or document type filter.
    </p>
  </div>
);

const Modal = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default EmployeeDocumentsScreen;
