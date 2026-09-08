import React from "react";
import Button from "./Button";
import { Check } from "lucide-react";

export default function InfoModal({
  title,
  text,
  onclick = () => {},
  btnBg = "bg-[#16A34A]",
  btnText = "OK",

  icon = (
    <div className="flex items-center justify-center p-4 bg-green-300 rounded-full">
      <Check className="text-green-950 font-bold" />
    </div>
  ),
}) {
  return (
    <div className="fixed bg-[rgba(0,0,0,0.5)] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[50%] w-[500px] p-4 rounded-2xl  bg-white flex flex-col items-center justify-center gap-2">
        {icon}

        <h2 className="font-bold text-xl">{title}</h2>
        <p className="font-medium">{text}</p>
        <Button onClick={onclick} text={btnText} bgColor={btnBg} />
      </div>
    </div>
  );
}
