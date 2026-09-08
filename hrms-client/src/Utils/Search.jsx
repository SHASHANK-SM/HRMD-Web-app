import { SearchIcon } from "lucide-react";

const Search = ({ anotherStyle = "w-[200px", value, onChange }) => {
  return (
    <div
      className={`${anotherStyle} border border-borderColor h-[45px] px-2 flex items-center rounded-md overflow-hidden gap-2 `}
    >
      <SearchIcon size={20} color="gray" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-[95%] h-full border-none outline-none"
        placeholder="Enter here"
      />
    </div>
  );
};

export default Search;
