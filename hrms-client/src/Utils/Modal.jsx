import { X } from "lucide-react";
import { motion as _motion, AnimatePresence } from "framer-motion";

const backdropVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariant = {
  hidden: { opacity: 0, scale: 0.9, y: "-50%", x: "-50%" },
  visible: {
    opacity: 1,
    scale: 1,
    y: "-50%",
    x: "-50%",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

const Modal = ({
  isOpen,
  onClose,
  title = "Modal Title",
  children,
  width = "500px",
  height = "400px",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <_motion.div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
          variants={backdropVariant}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <_motion.div
            variants={modalVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bg-white rounded-md shadow-lg flex flex-col"
            style={{ width, maxHeight: height, top: "50%", left: "50%" }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose}>
                <X className="text-gray-500 hover:text-red-500" size={20} />
              </button>
            </div>

            <div
              className="overflow-y-auto p-4"
              style={{ maxHeight: `calc(${height} - 60px)` }}
            >
              {children}
            </div>
          </_motion.div>
        </_motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
