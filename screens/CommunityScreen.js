import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockCurrentUser = {
  id: 1,
  name: "longdev",
  avatar: "https://i.pravatar.cc/150?img=1",
};

// Mock API functions
const getPosts = async () => {
  return [
    {
      id: 1,
      authorId: 1,
      authorName: "longdev",
      authorAvatar: "https://i.pravatar.cc/150?img=1",
      content: "Tôi đã 10 ngày rồi! Cảm giác thật tuyệt!",
      image: null,
      likes: 20,
      likedBy: [1],
      comments: [],
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      authorId: 2,
      authorName: "user5",
      authorAvatar: "https://i.pravatar.cc/150?img=5",
      content: "100K tiết kiệm! Cố lên mọi người!",
      image:
        "https://afamilycdn.com/2017/20638449-1406376249483083-422622957669382557-n-1502112708692.jpg",
      likes: 15,
      likedBy: [],
      comments: [
        {
          id: 1,
          authorId: 3,
          authorName: "user3",
          authorAvatar: "https://i.pravatar.cc/150?img=3",
          content: "Chúc mừng bạn!",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 43200000).toISOString(),
    },
  ];
};

const createPost = async (postData) => {
  return {
    ...postData,
    id: Date.now(),
    likes: 0,
    likedBy: [],
    comments: [],
    timestamp: new Date().toISOString(),
  };
};

const updatePost = async (postId, postData) => {
  return { ...postData, id: postId };
};

const deletePost = async (postId) => {
  return true;
};

const getComments = async (postId) => {
  return [
    {
      id: Date.now(),
      authorId: 4,
      authorName: "user4",
      authorAvatar: "https://i.pravatar.cc/150?img=4",
      content: "Bài viết rất hay!",
      timestamp: new Date().toISOString(),
    },
  ];
};

const createComment = async (commentData) => {
  return {
    ...commentData,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };
};

const PostCard = ({ item, onLike, onDelete, onEdit, onComment }) => {
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(); // Thêm ref cho input comment

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Vừa xong";
      return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Error formatting time:", err);
      return "Vừa xong";
    }
  };

  return (
    <View style={styles.postCard}>
      <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.postHeader}>
        <Image
          source={{
            uri: item.authorAvatar || "https://i.pravatar.cc/150?img=1",
          }}
          style={styles.avatar}
          onError={(e) => console.error("Error loading avatar:", e)}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.authorName}>
            {item.authorName || "Người dùng"}
          </Text>
          <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
        {item.authorId === mockCurrentUser.id && (
          <View style={styles.postActions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <MaterialIcons name="edit" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
              <MaterialIcons name="delete" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image && (
        <TouchableOpacity onPress={() => onComment(item.image)}>
          <Image
            source={{ uri: item.image }}
            style={styles.postImage}
            onError={(e) => console.error("Error loading post image:", e)}
          />
        </TouchableOpacity>
      )}
      <View style={styles.postFooter}>
        <TouchableOpacity
          onPress={() => onLike(item.id)}
          style={styles.iconRow}
        >
          <FontAwesome
            name={
              item.likedBy.includes(mockCurrentUser.id)
                ? "thumbs-up"
                : "thumbs-o-up"
            }
            size={18}
            color={
              item.likedBy.includes(mockCurrentUser.id) ? "#3b82f6" : "#6b7280"
            }
          />
          <Text style={styles.iconText}> {item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => commentInputRef.current?.focus()}
          style={styles.iconRow}
        >
          <FontAwesome name="commenting" size={18} color="#6b7280" />
          <Text style={styles.iconText}> {item.comments.length || 0}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentSection}>
        {item.comments.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <Image
              source={{
                uri: comment.authorAvatar || "https://i.pravatar.cc/150?img=1",
              }}
              style={styles.commentAvatar}
              onError={(e) => console.error("Error loading comment avatar:", e)}
            />
            <View style={styles.commentContent}>
              <Text style={styles.commentAuthor}>{comment.authorName}</Text>
              <Text style={styles.commentText}>{comment.content}</Text>
              <Text style={styles.commentTimestamp}>
                {formatTime(comment.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.commentInputContainer}>
          <TextInput
            ref={commentInputRef} // Gán ref vào đây
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Viết bình luận..."
            style={styles.commentInput}
          />
          <TouchableOpacity
            onPress={() => {
              onComment(item.id, commentText);
              setCommentText("");
            }}
            style={styles.commentButton}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const LeaderboardSection = ({ leaderboardData }) => {
  const mockLeaderboard = [
    { rank: 1, name: "user1", days: 100 },
    { rank: 2, name: "user2", days: 95 },
    { rank: 3, name: "user3", days: 90 },
  ];

  const dataToShow =
    leaderboardData.length > 0 ? leaderboardData : mockLeaderboard;

  return (
    <View style={styles.leaderboardContainer}>
      <Text style={styles.leaderboardTitle}>Bảng xếp hạng</Text>
      {dataToShow.map((user, index) => (
        <View key={user.name} style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRank}>
            {index === 0
              ? "🥇"
              : index === 1
              ? "🥈"
              : index === 2
              ? "🥉"
              : `${index + 1}`}
          </Text>
          <Text style={styles.leaderboardName}>{user.name}</Text>
          <Text style={styles.leaderboardDays}> {user.days} ngày</Text>
        </View>
      ))}
    </View>
  );
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ text: "", image: null });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const mockPosts = await getPosts();
      setPosts(mockPosts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const mockLeaderboard = [
        { rank: 1, name: "user1", days: 100 },
        { rank: 2, name: "user2", days: 95 },
        { rank: 3, name: "user3", days: 90 },
      ];
      setLeaderboard(mockLeaderboard);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      const mockLeaderboard = [
        { rank: 1, name: "user1", days: 100 },
        { rank: 2, name: "user2", days: 95 },
        { rank: 3, name: "user3", days: 90 },
      ];
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      const fetchedComments = await getComments(postId);
      setComments((prev) => ({ ...prev, [postId]: fetchedComments }));
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments((prev) => ({ ...prev, [postId]: [] }));
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh");
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets) {
        const fileSize = result.assets[0].fileSize || 0;
        if (fileSize > 5 * 1024 * 1024) {
          setError("Ảnh quá lớn (tối đa 5MB)");
          return;
        }
        setNewPost({ ...newPost, image: result.assets[0].uri });
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Không thể chọn ảnh");
    }
  };

  const handleCreateOrUpdatePost = async () => {
    if (newPost.text.trim() === "") {
      setError("Nội dung không được để trống");
      return;
    }
    setLoading(true);
    try {
      const postData = {
        authorId: mockCurrentUser.id,
        authorName: mockCurrentUser.name,
        authorAvatar: mockCurrentUser.avatar,
        content: newPost.text,
        image: newPost.image,
        likes: 0,
        likedBy: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };

      if (editingPost) {
        // Mock update
        const updatedPost = await updatePost(editingPost.id, {
          content: newPost.text,
          image: newPost.image,
        });
        setPosts(
          posts.map((post) =>
            post.id === editingPost.id ? { ...post, ...updatedPost } : post
          )
        );
        setEditingPost(null);
      } else {
        // Mock create
        const createdPost = await createPost(postData);
        setPosts([createdPost, ...posts]);
      }

      setNewPost({ text: "", image: null });
      setShowCreatePost(false);
      setError(null);
    } catch (err) {
      console.error("Error creating/updating post:", err);
      setError("Không thể đăng bài");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    const postToDelete = posts.find((post) => post.id === id);
    if (postToDelete.authorId !== mockCurrentUser.id) {
      Alert.alert(
        "Không thể xoá",
        "Bạn chỉ có thể xoá bài viết của chính mình."
      );
      return;
    }
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá bài viết này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        onPress: async () => {
          try {
            await deletePost(id);
            // Sửa lỗi: Cập nhật state đúng cách
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
          } catch (err) {
            console.error("Error deleting post:", err);
            Alert.alert("Lỗi", "Không thể xoá bài viết");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleLikePost = (id) => {
    try {
      setPosts(
        posts.map((post) => {
          if (post.id === id) {
            const liked = post.likedBy.includes(mockCurrentUser.id);
            return {
              ...post,
              likes: liked ? post.likes - 1 : post.likes + 1,
              likedBy: liked
                ? post.likedBy.filter((uid) => uid !== mockCurrentUser.id)
                : [...post.likedBy, mockCurrentUser.id],
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Error liking post:", err);
      setError("Không thể thực hiện thao tác");
    }
  };

  const handleAddComment = async (postId, commentText) => {
    if (commentText.trim() === "") return;
    try {
      const commentData = {
        postId,
        authorId: mockCurrentUser.id,
        authorName: mockCurrentUser.name,
        authorAvatar: mockCurrentUser.avatar,
        content: commentText,
        timestamp: new Date().toISOString(),
      };
      const createdComment = await createComment(commentData);
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), createdComment],
      }));
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), createdComment] }
            : post
        )
      );
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Không thể thêm bình luận");
    }
  };

  const handleImageModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({ text: post.content, image: post.image });
    setShowCreatePost(true);
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <LinearGradient colors={["#3b82f6", "#2563eb"]} style={styles.header}>
          <Text style={styles.headerTitle}>Cộng đồng cai thuốc</Text>
          <TouchableOpacity
            onPress={() => {
              setShowCreatePost(!showCreatePost);
              setEditingPost(null);
              setNewPost({ text: "", image: null });
              setError(null);
            }}
          >
            <Ionicons
              name={showCreatePost ? "close" : "create"}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </LinearGradient>

        {showCreatePost && (
          <View style={styles.createPostForm}>
            <Text style={styles.formTitle}>
              {editingPost ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TextInput
              value={newPost.text}
              onChangeText={(text) => setNewPost({ ...newPost, text })}
              placeholder="Chia sẻ cảm nghĩ của bạn..."
              multiline
              style={styles.textInput}
            />
            {newPost.image && (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{ uri: newPost.image }}
                  style={styles.previewImage}
                  onError={(e) =>
                    console.error("Error loading preview image:", e)
                  }
                />
                <TouchableOpacity
                  onPress={() => setNewPost({ ...newPost, image: null })}
                  style={styles.removeImageButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.formButtons}>
              <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
                <Entypo name="image" size={20} color="#fff" />
                <Text style={styles.imageBtnText}>Chọn ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateOrUpdatePost}
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                disabled={loading}
              >
                <Text style={styles.submitBtnText}>
                  {loading
                    ? "Đang xử lý..."
                    : editingPost
                    ? "Cập nhật"
                    : "Đăng bài"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchPosts} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
          </View>
        ) : (
          <>
            <LeaderboardSection leaderboardData={leaderboard} />
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <PostCard
                  item={{
                    ...item,
                    comments: comments[item.id] || item.comments,
                  }}
                  onLike={handleLikePost}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                  onComment={handleImageModal} // Sửa thành hàm mở ảnh
                />
              )}
              contentContainerStyle={styles.postList}
              showsVerticalScrollIndicator={false}
              onEndReached={() => fetchCommentsForPost(posts[0]?.id)} // Fetch comments for first post as example
              onEndReachedThreshold={0.5}
              ListFooterComponent={<View style={{ height: 100 }} />}
            />
          </>
        )}

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                onError={(e) => {
                  console.error("Error loading modal image:", e);
                  setModalVisible(false);
                  setError("Không thể tải ảnh");
                }}
              />
            )}
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 0 : 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  createPostForm: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 10,
    borderRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 10,
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 10,
    fontSize: 14,
  },
  textInput: {
    minHeight: 80,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 10,
    fontSize: 16,
  },
  previewImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  imageBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitBtnDisabled: {
    backgroundColor: "#6ee7b7",
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  postList: {
    padding: 10,
  },
  postCard: {
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1f2937",
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  postActions: {
    flexDirection: "row",
    gap: 15,
  },
  postContent: {
    fontSize: 15,
    color: "#374151",
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  postFooter: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingBottom: 10,
    gap: 20,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  iconText: {
    fontSize: 14,
    color: "#6b7280",
  },
  commentSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    padding: 15,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1f2937",
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
    backgroundColor: "#f9fafb",
    fontSize: 14,
  },
  commentButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 8,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  leaderboardContainer: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  leaderboardRank: {
    fontSize: 18,
    color: "#3b82f6",
  },
  leaderboardName: {
    fontSize: 16,
    color: "#374151",
  },
  leaderboardDays: {
    fontSize: 16,
    color: "#6b7280",
  },
});
