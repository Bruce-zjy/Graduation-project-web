"use client";

import { motion } from "framer-motion";

const gradients = [
  "linear-gradient(135deg, #ff00ff, #5500ff, #0000ff)",
  "linear-gradient(135deg, #00ff99, #0099ff, #0000ff)",
  "linear-gradient(135deg, #ff9900, #ff0000, #9900ff)",
  "linear-gradient(135deg, #00ffff, #00ff00, #ffff00)",
  "linear-gradient(135deg, #ff0000, #ff00ff, #5500ff)",
];

const Background = ({ gradientIndex }: { gradientIndex: number }) => {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      animate={{ background: gradients[gradientIndex] }}
      transition={{ duration: 5, ease: "easeInOut" }} // 让渐变更自然
      style={{
        background: gradients[gradientIndex],
        transition: "background 5s ease-in-out",
      }}
    />
  );
};

export default Background;
