import { Edit2Icon } from "lucide-react";

const BorderEditIconCard = ({ children, lable, onClick }) => {
  return (
    <div className="w-full border border-borderColor p-4 rounded-2xl flex flex-col gap-2">
      <div className="w-full flex justify-between items-center border-b border-b-gray-500 pb-1">
        <span>{lable}</span>
        <button onClick={onClick}>
          <Edit2Icon size={20} color="gray" />
        </button>
      </div>
      {children}
    </div>
  );
};

export default BorderEditIconCard;
