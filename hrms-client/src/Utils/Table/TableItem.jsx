const TableItem = ({ columns, row }) => {
  return (
    <div
      //   style={{ backgroundColor: row._id === worUser?._id ? "#fcf0f6" : "" }}
      className="text-base flex items-center px-3 gap-2 border-b border-b-gray-200 cursor-pointer relative py-2"
      //   onClick={handleSetWorUser}
    >
      {columns.map((column, index) => (
        <div key={index} style={{ width: column.width }}>
          {column.render ? column.render(row) : null}
        </div>
      ))}
    </div>
  );
};

export default TableItem;
