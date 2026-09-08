const IconButton = ({
  icon,
  text,
  onClick,
  bgColor = "white",
  textColor = "#333",
  borderColor = "#D6D6D6",
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderColor,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default IconButton;
