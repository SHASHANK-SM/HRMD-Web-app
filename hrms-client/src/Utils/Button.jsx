// import { BeatLoader } from "react-spinners";

// const Button = ({
//   text,
//   bgColor = "bg-black",
//   textColor = "text-white",
//   onClick,
//   className = "",
//   type = "button",
//   loading,
// }) => {
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       className={`w-full h-[45px] rounded-md font-medium ${bgColor} ${textColor} ${className}`}
//     >
//       {loading ? <BeatLoader color="#fff" size={10} /> : text}
//     </button>
//   );
// };

// export default Button;

import { BeatLoader } from "react-spinners";

const Button = ({
  children,
  bgColor = "bg-black",
  textColor = "text-white",
  onClick,
  className = "",
  type = "button",
  loading,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full h-[45px] rounded-md font-medium ${bgColor} ${textColor} ${className}`}
    >
      {loading ? <BeatLoader color="#fff" size={10} /> : children}
    </button>
  );
};

export default Button;
