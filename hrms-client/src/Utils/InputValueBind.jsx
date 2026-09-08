import { Eye } from "lucide-react";

const InputValueBind = ({
  width = "w-[350px]",
  label,
  value,
  isDisplayEye = false,
}) => {
  return (
    <div className={`flex flex-col gap-1 ${width}`}>
      <span className="text-sm font-semibold ">{label}</span>
      <div className="relative">
        <span className="w-full h-[45px] border border-borderColor rounded-md outline-none px-4 flex items-center">
          {value}
        </span>
        {isDisplayEye && (
          <Eye className="absolute right-3 top-2 cursor-pointer" />
        )}
      </div>
    </div>
  );
};

export default InputValueBind;
