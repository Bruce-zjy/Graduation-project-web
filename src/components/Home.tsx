"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Background from "./Background";
import { motion } from "framer-motion";

const gradients = [
  "linear-gradient(135deg, #ff00ff, #5500ff, #0000ff)",
  "linear-gradient(135deg, #00ff99, #0099ff, #0000ff)",
  "linear-gradient(135deg, #ff9900, #ff0000, #9900ff)",
  "linear-gradient(135deg, #00ffff, #00ff00, #ffff00)",
  "linear-gradient(135deg, #ff0000, #ff00ff, #5500ff)",
];

const Home = () => {
  const [gradientIndex, setGradientIndex] = useState(0);
  const [buttonGradient, setButtonGradient] = useState(gradients[0]);

  // 控制颜色同步变化
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % gradients.length;
        setButtonGradient(gradients[nextIndex]); // **在父组件同步更新**
        return nextIndex;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      {/* 背景组件 */}
      <Background gradientIndex={gradientIndex} />

      {/* 内容 */}
      <div className="relative z-10 text-center">
        <h1 className="text-white text-5xl font-bold mb-6">Welcome to Home</h1>
        <div className="flex space-x-4">
          <Link href="/beginTouse">
            <motion.button
              className="relative px-8 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-lg shadow-lg hover:scale-105 focus:ring-2 focus:ring-indigo-400"
              animate={{ background: buttonGradient }}
              transition={{ duration: 5, ease: "easeInOut" }} // 确保按钮同步渐变
              style={{
                background: buttonGradient,
                transition: "background 5s ease-in-out",
              }}
            >
              🌟 Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
