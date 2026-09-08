const TableHeader = ({ columns }) => {
  return (
    <div className="w-full h-[45px] overflow-hidden flex items-center  p-4 border-b border-gray-300 gap-2 bg-[#F8F8F8]">
      {columns?.map((column, index) => (
        <span
          key={index}
          className="text-[#64748b] text-base font-semibold font-roboto"
          style={{ width: column.width || "auto" }}
        >
          {column.name}
        </span>
      ))}
    </div>
  );
};

export default TableHeader;
