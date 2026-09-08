// Input.jsx

const Input = ({
  label,
  name,
  register,
  type = "text",
  errors,
  validation,
  extraProps = {},
  readOnly,
}) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-sans font-semibold">
        {label}
      </label>
      <input
        id={name}
        {...register(name, validation)}
        className={`w-full h-[45px] border rounded-md px-2 ${
          errors?.[name] ? "border-red-500" : "border-borderColor"
        }`}
        type={type}
        readOnly={readOnly}
        {...extraProps}
      />
      {errors?.[name] && (
        <p className="text-red-500 text-xs">{errors[name].message}</p>
      )}
    </div>
  );
};

export default Input;
