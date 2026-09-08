const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const analyzeCHM = async (polygon, year) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chm/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polygon, year }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};