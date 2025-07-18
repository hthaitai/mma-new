import axios from 'axios';
const API_URL = 'http://10.0.2.2:8080/api/smoking-status'

export const getStatusSmoking = async (id, token) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
}

export const createStatusSmoking = async (id, token, formData) => {
    try {
        const response = await axios.post(
            `${API_URL}/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
}
