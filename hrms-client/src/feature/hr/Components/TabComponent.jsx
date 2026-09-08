const tabData = ["General", "Job", "Payroll", "Document"];

const TabComponent = ({ handleTab, tab }) => {
  return (
    <div className="w-full flex gap-6 items-center border-b border-gray-300">
      {tabData.map((tabName) => (
        <button
          key={tabName}
          onClick={() => handleTab(tabName)}
          className={`pb-2 text-sm font-medium capitalize relative transition-all duration-300 ${
            tab === tabName
              ? "text-[#ff6600] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#ff6600]"
              : "text-gray-600 hover:text-[#ff6600]"
          }`}
        >
          {tabName}
        </button>
      ))}
    </div>
  );
};

export default TabComponent;
