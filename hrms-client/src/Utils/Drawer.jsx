import { ChevronRight } from "lucide-react";
import { motion as _motion } from "framer-motion";

const Drawer = ({ onClose, children, isOpen, anotherStyles = "w-[30%]" }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={onClose}
        />
      )}
      {isOpen && (
        <ChevronRight
          onClick={onClose}
          className="fixed left-[calc(70%-40px)] top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 w-8 h-8 cursor-pointer z-50"
        />
      )}
      <_motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 right-0 ${anotherStyles} h-full bg-white shadow-lg z-50 p-5 flex flex-col gap-4`}
      >
        <div className="w-full h-[95%] overflow-y-scroll">{children}</div>
      </_motion.div>
    </>
  );
};

export default Drawer;
