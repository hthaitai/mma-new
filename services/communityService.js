import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8080/api";

const getToken = async () => (await AsyncStorage.getItem("token")) || "";

export const getPosts = async () => {
  const token = await getToken();
  try {
    const res = await axios.get(`${API_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.map((post) => ({
      ...post,
      timestamp: new Date(post.timestamp).toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
};

export const createPost = async (postData) => {
  const token = await getToken();
  try {
    const res = await axios.post(`${API_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { id: Date.now(), ...res.data, timestamp: new Date().toISOString() };
  } catch (err) {
    console.error("Error creating post:", err);
    throw err;
  }
};

export const updatePost = async (id, postData) => {
  const token = await getToken();
  try {
    await axios.put(`${API_URL}/posts/${id}`, postData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Error updating post:", err);
    throw err;
  }
};

export const deletePost = async (id) => {
  const token = await getToken();
  try {
    await axios.delete(`${API_URL}/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Error deleting post:", err);
    throw err;
  }
};

export const getComments = async (postId) => {
  const token = await getToken();
  try {
    const res = await axios.get(`${API_URL}/comments?postId=${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.map((comment) => ({
      ...comment,
      timestamp: new Date(comment.timestamp).toISOString(),
    }));
  } catch (err) {
    console.error("Error fetching comments:", err);
    return [];
  }
};

export const createComment = async (commentData) => {
  const token = await getToken();
  try {
    const res = await axios.post(`${API_URL}/comments`, commentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { id: Date.now(), ...res.data, timestamp: new Date().toISOString() };
  } catch (err) {
    console.error("Error creating comment:", err);
    throw err;
  }
};

export const getLeaderboard = async () => {
  const token = await getToken();
  try {
    const res = await axios.get(`${API_URL}/badges/leaderboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.data) throw new Error("No data returned");
    return res.data.map((item, index) => ({ ...item, rank: index + 1 }));
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return [];
  }
};
