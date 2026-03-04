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
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch (e) {
        // Si no es JSON, usamos el status como mensaje
        errorBody = { error: `Error ${response.status}: ${response.statusText}` };
      }
      const error = new Error(errorBody.error || `Error: ${response.status}`);
      error.statusCode = response.status;
      error.isBusinessError = true;
      throw error;
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    // Si ya es un error de negocio o custom, lo relanzamos
    if (error.isBusinessError || error instanceof TypeError === false) {
      throw error;
    }
    // Error de conexión
    const connectionError = new Error("Error de conexión con el servidor");
    connectionError.isConnectionError = true;
    console.error("Error de conexión:", error.message);
    throw connectionError;
  }
};
