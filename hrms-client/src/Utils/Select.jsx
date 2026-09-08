import React from "react";

const Select = ({
  label,
  name,
  options = [],
  onChange,
  value,
  firstOption,
  width = "w-[150px]",
  bgColor = "white",
  textColor = "#333",
}) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      className={`${width} flex flex-col gap-1`}
    >
      {label && (
        <label htmlFor={name} className="text-sm font-sans font-semibold">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-[45px] border border-gray-400 rounded-md px-2 outline-none"
      >
        <option value="" disabled>
          Select {firstOption}
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
