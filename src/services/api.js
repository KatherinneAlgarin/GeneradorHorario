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
      const error = new Error(errorBody.error || `Error: ${response.status}`);
      error.statusCode = response.status;
      error.isBusinessError = true;
      throw error;
    }

    return await response.json();
  } catch (error) {
    //  errores de conexión o técnicos
    // Los errores de negocio se manejan en los hooks
    if (!error.isBusinessError) {
      console.error("Error en la conexión con la API:");
    }
    throw error;
  }
};
