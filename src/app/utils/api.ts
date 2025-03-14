const API_BASE_URL = "http://localhost:5000"; // 你的后端 API 服务器地址

export const fetchPrediction = async (model: string, features: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ models: [model], features }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return data; // 返回后端的 JSON 结果
  } catch (error) {
    console.error("API Error:", error);
    return { error: "Failed to fetch prediction" };
  }
};
