import axios from 'axios'

const API_BASE_URL = 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handler
const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data.error || 'An error occurred')
  } else if (error.request) {
    throw new Error('No response from server. Please check your connection.')
  } else {
    throw new Error(error.message || 'An error occurred')
  }
}

// Authentication API
export const loginUser = async (identifier, password) => {
  try {
    const response = await api.post('/auth/login', { identifier, password })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const registerUser = async (username, name, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      username,
      name,
      email,
      password,
    })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const searchUsers = async (searchTerm) => {
  try {
    const response = await api.get(`/auth/search?q=${searchTerm}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}


export async function getEquipmentCatalog() {
  try {
    const res = await api.get("/equipment/catalog");
    return res.data;
  } catch (err) {
    console.error("API error in getEquipmentCatalog:", err);
    throw err;
  }
}

export const getEquipmentType = async (equipmentTypeId) => {
  try {
    const response = await api.get(`/equipment/catalog/${equipmentTypeId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const addEquipmentType = async (equipmentData) => {
  try {
    const response = await api.post('/equipment/catalog', equipmentData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}


export const getUserEquipment = async (userId) => {
  try {
    const response = await api.get(`/equipment/user/${userId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const addEquipmentToUser = async (userId, equipmentData) => {
  try {
    const response = await api.post(`/equipment/user/${userId}`, equipmentData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const getEquipmentById = async (equipmentId) => {
  try {
    const response = await api.get(`/equipment/${equipmentId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const deleteEquipment = async (equipmentId) => {
  try {
    const response = await api.delete(`/equipment/${equipmentId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Maintenance API
export const recordMaintenance = async (equipmentId, maintenanceDate = null) => {
  try {
    const response = await api.post(`/equipment/${equipmentId}/maintenance`, {
      maintenance_date: maintenanceDate,
    })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const getMaintenanceSummary = async (userId) => {
  try {
    const response = await api.get(`/equipment/user/${userId}/maintenance-summary`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

// Shop Spaces API
export const getAllShops = async () => {
  try {
    const response = await api.get('/shops/')
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const createShop = async (shopData) => {
  try {
    const response = await api.post('/shops/', shopData)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const getShopById = async (shopId) => {
  try {
    const response = await api.get(`/shops/${shopId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const getShopsByUsername = async (username) => {
  try {
    const response = await api.get(`/shops/user/${username}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const updateShopDimensions = async (shopId, dimensions) => {
  try {
    const response = await api.put(`/shops/${shopId}`, dimensions)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const deleteShop = async (shopId) => {
  try {
    const response = await api.delete(`/shops/${shopId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}



export async function addEquipmentToShop(shopId, { equipmentId, x, y, z = 0 }) {
  try {
    const response = await api.post(`/shops/${shopId}/equipment`, {
      equipment_id: equipmentId,   
      x_coordinate: x,
      y_coordinate: y,
      z_coordinate: z,
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}




export const removeEquipmentFromShop = async (shopId, equipmentId) => {
  try {
    const response = await api.delete(`/shops/${shopId}/equipment/${equipmentId}`)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export default api
