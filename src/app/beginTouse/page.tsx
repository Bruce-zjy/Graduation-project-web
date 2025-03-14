"use client";

import { useState, useEffect } from "react";
import Background from "@/components/Background";
import { fetchPrediction } from "@/app/utils/api";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

// 日期选择组件
const DateSelector = ({ 
  checkInDate,
  checkOutDate,
  onCheckInDateChange,
  onCheckOutDateChange
}) => {
  
  // 处理入住日期变化
  const handleCheckInChange = (e) => {
    const newDate = dayjs(e.target.value);
    onCheckInDateChange(newDate);
  };
  
  // 处理退房日期变化
  const handleCheckOutChange = (e) => {
    const newDate = dayjs(e.target.value);
    onCheckOutDateChange(newDate);
  };
  
  return (
    <div className="bg-indigo-50/70 backdrop-filter backdrop-blur-sm p-4 rounded-lg mb-4 border border-indigo-100/50">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3">日期选择</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 入住日期选择器 */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">入住日期</label>
          <input
            type="date"
            value={checkInDate.format("YYYY-MM-DD")}
            onChange={handleCheckInChange}
            className="px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300 bg-white/80"
          />
          <div className="text-sm text-gray-500 mt-1">
            星期 {checkInDate.format("dddd")}
          </div>
        </div>
        
        {/* 退房日期选择器 */}
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">退房日期</label>
          <input
            type="date"
            value={checkOutDate.format("YYYY-MM-DD")}
            onChange={handleCheckOutChange}
            className="px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300 bg-white/80"
          />
          <div className="text-sm text-gray-500 mt-1">
            星期 {checkOutDate.format("dddd")}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>提前预订天数: {checkInDate.diff(dayjs(), 'day')} 天</p>
        <p>住宿总天数: {checkOutDate.diff(checkInDate, 'day')} 天</p>
      </div>
    </div>
  );
};

export default function BeginTouse() {
  const [gradientIndex, setGradientIndex] = useState(0);
  const [model, setModel] = useState("RF_model");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 初始化日期
  const today = dayjs();
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(today.add(1, 'day'));

  // **数值特征**
  const [numFeatures, setNumFeatures] = useState({
    lead_time: 0,
    arrival_date_week_number: today.week(),
    arrival_date_day_of_month: today.date(),
    stays_in_weekend_nights: 0,
    stays_in_week_nights: 1,
    adults: 2,
    children: 0,
    babies: 0,
    is_repeated_guest: 0,
    previous_cancellations: 0,
    previous_bookings_not_canceled: 0,
    agent: 0,
    company: 0,
    required_car_parking_spaces: 0,
    total_of_special_requests: 2,
    adr: 50,
  });

  // **分类特征**
  const [catFeatures, setCatFeatures] = useState({
    hotel: "Resort Hotel",
    arrival_date_month: today.format("MMMM"),
    meal: "",
    market_segment: "",
    distribution_channel: "",
    reserved_room_type: "",
    deposit_type: "",
    customer_type: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prevIndex) => (prevIndex + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 计算工作日和周末晚数
  const calculateNights = (startDate, endDate) => {
    const diffDays = endDate.diff(startDate, 'day');
    let weekendNights = 0;
    let weekNights = 0;
    
    // 计算从开始日期到结束日期之间有多少天
    for (let i = 0; i < diffDays; i++) {
      const currentDay = startDate.add(i, 'day');
      const dayOfWeek = currentDay.day(); // 0 是周日，6 是周六
      
      // 周五和周六晚上算作周末
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        weekendNights++;
      } else {
        weekNights++;
      }
    }
    
    return { weekNights, weekendNights };
  };

  // 入住日期变更处理
  const handleCheckInDateChange = (newDate) => {
    // 如果新入住日期晚于退房日期，则自动调整退房日期
    let newCheckOutDate = checkOutDate;
    if (newDate.isAfter(checkOutDate) || newDate.isSame(checkOutDate)) {
      newCheckOutDate = newDate.add(1, 'day');
      setCheckOutDate(newCheckOutDate);
    }
    
    setCheckInDate(newDate);
    
    // 计算 lead_time
    const leadTime = newDate.diff(dayjs(), 'day');
    
    // 计算工作日和周末晚数
    const { weekNights, weekendNights } = calculateNights(newDate, newCheckOutDate);
    
    // 更新相关特征
    setNumFeatures(prev => ({
      ...prev,
      lead_time: leadTime >= 0 ? leadTime : 0,
      arrival_date_week_number: newDate.week(),
      arrival_date_day_of_month: newDate.date(),
      stays_in_week_nights: weekNights,
      stays_in_weekend_nights: weekendNights
    }));
    
    setCatFeatures(prev => ({
      ...prev,
      arrival_date_month: newDate.format("MMMM")
    }));
  };

  // 退房日期变更处理
  const handleCheckOutDateChange = (newDate) => {
    // 如果新退房日期早于入住日期，则不做改变
    if (newDate.isBefore(checkInDate) || newDate.isSame(checkInDate)) {
      return;
    }
    
    setCheckOutDate(newDate);
    
    // 计算工作日和周末晚数
    const { weekNights, weekendNights } = calculateNights(checkInDate, newDate);
    
    // 更新相关特征
    setNumFeatures(prev => ({
      ...prev,
      stays_in_week_nights: weekNights,
      stays_in_weekend_nights: weekendNights
    }));
  };

  // 根据特征字段更新日期
  const updateDatesFromFeatures = () => {
    // 基于 lead_time 计算入住日期
    const newCheckInDate = dayjs().add(numFeatures.lead_time, 'day');
    
    // 调整入住日期到指定的周和月中日期
    // 这里简化处理，实际上可能需要更复杂的逻辑
    let adjustedCheckInDate = newCheckInDate;
    
    // 计算退房日期
    const totalNights = numFeatures.stays_in_week_nights + numFeatures.stays_in_weekend_nights;
    const newCheckOutDate = adjustedCheckInDate.add(totalNights, 'day');
    
    setCheckInDate(adjustedCheckInDate);
    setCheckOutDate(newCheckOutDate);
  };

  // 数值特征更新
  const handleNumChange = (e, key) => {
    const value = Number(e.target.value) || 0;
    
    // 特殊处理某些字段
    if (key === "arrival_date_week_number" || 
        key === "arrival_date_day_of_month" || 
        key === "lead_time" ||
        key === "stays_in_week_nights" ||
        key === "stays_in_weekend_nights") {
      
      setNumFeatures(prev => ({ ...prev, [key]: value }));
      
      // 字段更新后更新日期
      setTimeout(() => {
        if (key === "lead_time") {
          // 更新入住日期基于新的lead_time
          const newCheckInDate = dayjs().add(value, 'day');
          handleCheckInDateChange(newCheckInDate);
        } 
        else if (key === "stays_in_week_nights" || key === "stays_in_weekend_nights") {
          // 更新退房日期基于住宿晚数
          const weekNights = key === "stays_in_week_nights" ? value : numFeatures.stays_in_week_nights;
          const weekendNights = key === "stays_in_weekend_nights" ? value : numFeatures.stays_in_weekend_nights;
          const newCheckOutDate = checkInDate.add(weekNights + weekendNights, 'day');
          setCheckOutDate(newCheckOutDate);
        }
        else {
          // 其他日期相关字段，完全更新日期
          updateDatesFromFeatures();
        }
      }, 0);
    } else {
      // 处理其他数值特征
      setNumFeatures(prev => ({ ...prev, [key]: value }));
    }
  };

  // 分类特征更新
  const handleCatChange = (e, key) => {
    setCatFeatures(prev => ({ ...prev, [key]: e.target.value || "" }));
  };

  // 提交请求
  const handleSubmit = async () => {
    setLoading(true);
    const features = [...Object.values(numFeatures), ...Object.values(catFeatures)];
    const data = await fetchPrediction(model, features);
    setResponseData(data);
    setLoading(false);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Background gradientIndex={gradientIndex} />
      <div className="relative z-10 bg-white/60 backdrop-filter backdrop-blur-md shadow-xl p-6 rounded-xl w-full max-w-4xl border border-white/20">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">酒店预订预测系统</h1>

        {/* 选择模型 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">选择模型:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-300 bg-white/80"
          >
            <option value="RF_model">Random Forest</option>
            <option value="XGB_model">XGB</option>
            <option value="DT_model">Decision Tree</option>
          </select>
        </div>

        {/* 日期选择组件 */}
        <DateSelector 
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onCheckInDateChange={handleCheckInDateChange}
          onCheckOutDateChange={handleCheckOutDateChange}
        />

        {/* 所有数值特征 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {Object.keys(numFeatures).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-700 font-medium">{key}</label>
              <input
                type="number"
                value={numFeatures[key]}
                onChange={(e) => handleNumChange(e, key)}
                className="px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-300 bg-white/80"
              />
            </div>
          ))}
        </div>

        {/* 所有分类特征 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {Object.keys(catFeatures).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="text-gray-700 font-medium">{key}</label>
              <input
                type="text"
                value={catFeatures[key]}
                onChange={(e) => handleCatChange(e, key)}
                className="px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-indigo-300 bg-white/80"
              />
            </div>
          ))}
        </div>

        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit} 
          className="w-full px-6 py-3 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition" 
          disabled={loading}
        >
          {loading ? "预测中..." : "提交"}
        </button>

        {/* 显示返回的预测数据 */}
        {responseData && <div className="mt-6 p-4 bg-gray-50/80 backdrop-filter backdrop-blur-sm shadow-md rounded-lg border border-gray-200/50"><pre className="text-gray-700 text-sm">{JSON.stringify(responseData, null, 2)}</pre></div>}
      </div>
    </div>
  );
}