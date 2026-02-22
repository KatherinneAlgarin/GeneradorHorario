//URL desde el .env de Vite
const BASE_URL = import.meta.env.VITE_API_URL;


export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.mensaje || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en la conexión con la API:", error.message);
    throw error;
  }
};