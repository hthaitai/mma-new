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
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  MaterialIcons,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Swipeable } from "react-native-gesture-handler";

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
      comments: [
        {
          id: 1,
          authorId: 3,
          authorName: "user3",
          authorAvatar: "https://i.pravatar.cc/150?img=3",
          content: "Chúc mừng bạn! Hãy tiếp tục phát huy nhé!",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 2,
          authorId: 4,
          authorName: "user4",
          authorAvatar: "https://i.pravatar.cc/150?img=4",
          content:
            "Mình cũng đang bắt đầu hành trình này. Có lời khuyên nào không?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 2,
      authorId: 2,
      authorName: "user5",
      authorAvatar: "https://i.pravatar.cc/150?img=5",
      content: "100K tiết kiệm mỗi ngày! Cố lên mọi người!",
      image:
        "https://afamilycdn.com/2017/20638449-1406376249483083-422622957669382557-n-1502112708692.jpg",
      likes: 35,
      likedBy: [1, 3],
      comments: [
        {
          id: 1,
          authorId: 3,
          authorName: "user3",
          authorAvatar: "https://i.pravatar.cc/150?img=3",
          content: "Chúc mừng bạn!",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 2,
          authorId: 1,
          authorName: "longdev",
          authorAvatar: "https://i.pravatar.cc/150?img=1",
          content:
            "Quá tuyệt vời! Mình cũng đang tiết kiệm cho một chuyến du lịch.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 3,
      authorId: 6,
      authorName: "healthylife",
      authorAvatar: "https://i.pravatar.cc/150?img=6",
      content:
        "Chia sẻ với mọi người một số mẹo vượt qua cơn thèm thuốc:\n1. Uống nước lọc khi thèm\n2. Hít thở sâu 10 lần\n3. Nhai kẹo cao su không đường\n4. Đánh răng ngay khi thèm",
      image: null,
      likes: 42,
      likedBy: [1, 2, 3],
      comments: [
        {
          id: 1,
          authorId: 7,
          authorName: "newbie",
          authorAvatar: "https://i.pravatar.cc/150?img=7",
          content: "Cảm ơn chia sẻ hữu ích! Mình sẽ thử ngay.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      timestamp: new Date(Date.now() - 7200000).toISOString(),
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
  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  return post ? post.comments : [];
};

const createComment = async (commentData) => {
  return {
    ...commentData,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  };
};

const getSuccessStories = () => {
  return [
    {
      id: 1,
      name: "Anh Tùng",
      days: 365,
      savings: 36500000,
      avatar: "https://i.pravatar.cc/150?img=8",
      story:
        "Sau 20 năm hút thuốc, tôi đã bỏ được nhờ sự hỗ trợ từ cộng đồng này. Cảm ơn mọi người!",
    },
    {
      id: 2,
      name: "Chị Mai",
      days: 180,
      savings: 18000000,
      avatar: "https://i.pravatar.cc/150?img=9",
      story:
        "Từ khi bỏ thuốc, sức khỏe của tôi cải thiện rõ rệt. Da dẻ hồng hào hơn, không còn ho vào buổi sáng nữa.",
    },
    {
      id: 3,
      name: "Bác Hải",
      days: 730,
      savings: 73000000,
      avatar: "https://i.pravatar.cc/150?img=10",
      story:
        "Tham gia cộng đồng này là quyết định đúng đắn nhất của tôi. Sau 2 năm không thuốc lá, tôi đã đi bộ đường dài cùng cháu nội.",
    },
  ];
};

const getHealthBenefits = () => {
  return [
    {
      id: 1,
      title: "20 phút",
      description: "Huyết áp và nhịp tim trở lại bình thường",
      icon: "heart-pulse",
    },
    {
      id: 2,
      title: "8 giờ",
      description: "Lượng oxy trong máu tăng, carbon monoxide giảm",
      icon: "lungs",
    },
    {
      id: 3,
      title: "48 giờ",
      description: "Khứu giác và vị giác cải thiện rõ rệt",
      icon: "food-apple",
    },
    {
      id: 4,
      title: "3 tháng",
      description: "Tuần hoàn máu và chức năng phổi được cải thiện",
      icon: "run",
    },
    {
      id: 5,
      title: "1 năm",
      description: "Nguy cơ mắc bệnh tim mạch giảm 50%",
      icon: "heart",
    },
  ];
};

const mockCurrentUser = {
  id: 1,
  name: "longdev",
  avatar: "https://i.pravatar.cc/150?img=1",
  daysSmokeFree: 10,
  moneySaved: 1000000,
  nextMilestone: 30,
  healthStats: {
    heartRate: "72 bpm",
    lungCapacity: "85%",
    oxygenLevel: "98%",
  },
};

const PostCard = ({
  item,
  onLike,
  onDelete,
  onEdit,
  onComment,
  onImagePress,
  onShare,
}) => {
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;

      if (isNaN(date.getTime())) return "Vừa xong";

      // Within last minute
      if (diffMs < 60000) return "Vừa xong";

      // Within last hour
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} phút trước`;

      // Today
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "Hôm qua";
      }

      // Within last week
      if (diffMs < 604800000) {
        return date.toLocaleDateString("vi-VN", { weekday: "long" });
      }

      // Otherwise
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (err) {
      console.error("Error formatting time:", err);
      return "Vừa xong";
    }
  };

  const renderRightActions = (progress, dragX) => {
    if (item.authorId !== mockCurrentUser.id) return null;

    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <Animated.View
        style={[styles.rightAction, { transform: [{ translateX: trans }] }]}
      >
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
      <Animated.View style={[styles.postCard, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={["#ffffff", "#f0f9ff"]}
          style={styles.postHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
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
            </View>
          )}
        </LinearGradient>

        <Text
          style={styles.postContent}
          numberOfLines={expanded ? undefined : 3}
        >
          {item.content}
        </Text>

        {item.content.length > 150 && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>
              {expanded ? "Thu gọn" : "Xem thêm..."}
            </Text>
          </TouchableOpacity>
        )}

        {item.image && (
          <TouchableOpacity onPress={() => onImagePress(item.image)}>
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
                item.likedBy.includes(mockCurrentUser.id)
                  ? "#3b82f6"
                  : "#6b7280"
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

          <TouchableOpacity
            onPress={() => onShare(item)}
            style={styles.iconRow}
          >
            <Feather name="share-2" size={18} color="#6b7280" />
            <Text style={styles.iconText}> Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentSection}>
          {item.comments.slice(0, expanded ? undefined : 2).map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Image
                source={{
                  uri:
                    comment.authorAvatar || "https://i.pravatar.cc/150?img=1",
                }}
                style={styles.commentAvatar}
                onError={(e) =>
                  console.error("Error loading comment avatar:", e)
                }
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

          {item.comments.length > 2 && !expanded && (
            <TouchableOpacity onPress={() => setExpanded(true)}>
              <Text style={styles.viewAllComments}>
                Xem tất cả {item.comments.length} bình luận
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.commentInputContainer}>
            <TextInput
              ref={commentInputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Viết bình luận..."
              style={styles.commentInput}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => {
                if (commentText.trim()) {
                  onComment(item.id, commentText);
                  setCommentText("");
                  commentInputRef.current?.blur();
                }
              }}
              style={styles.commentButton}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Swipeable>
  );
};

const HealthBenefitCard = ({ item }) => (
  <LinearGradient
    colors={["#f0f9ff", "#e0f2fe"]}
    style={styles.benefitCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <MaterialCommunityIcons
      name={item.icon}
      size={32}
      color="#0ea5e9"
      style={styles.benefitIcon}
    />
    <Text style={styles.benefitTitle}>{item.title}</Text>
    <Text style={styles.benefitDescription}>{item.description}</Text>
  </LinearGradient>
);

const SuccessStoryCard = ({ story }) => (
  <LinearGradient
    colors={["#f0fdf4", "#dcfce7"]}
    style={styles.storyCard}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.storyHeader}>
      <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
      <View>
        <Text style={styles.storyName}>{story.name}</Text>
        <Text style={styles.storyDays}>{story.days} ngày không thuốc lá</Text>
      </View>
    </View>
    <Text style={styles.storyText}>{story.story}</Text>
    <View style={styles.storyFooter}>
      <View style={styles.savingsBadge}>
        <MaterialIcons name="savings" size={16} color="#15803d" />
        <Text style={styles.savingsText}>
          Tiết kiệm: {(story.savings / 1000000).toFixed(1)} triệu đồng
        </Text>
      </View>
    </View>
  </LinearGradient>
);

const LeaderboardSection = ({ leaderboardData }) => {
  const dataToShow =
    leaderboardData.length > 0
      ? leaderboardData
      : [
          { rank: 1, name: "user1", days: 100 },
          { rank: 2, name: "user2", days: 95 },
          { rank: 3, name: "user3", days: 90 },
        ];

  return (
    <LinearGradient
      colors={["#fefce8", "#fffbeb"]}
      style={styles.leaderboardContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bảng xếp hạng</Text>
      </View>

      {dataToShow.map((user, index) => (
        <View
          key={user.name}
          style={[
            styles.leaderboardRow,
            index === 0 && styles.firstPlace,
            index === 1 && styles.secondPlace,
            index === 2 && styles.thirdPlace,
          ]}
        >
          <View style={styles.rankContainer}>
            {index === 0 ? (
              <MaterialIcons name="emoji-events" size={24} color="#f59e0b" />
            ) : index === 1 ? (
              <MaterialIcons name="emoji-events" size={24} color="#94a3b8" />
            ) : index === 2 ? (
              <MaterialIcons name="emoji-events" size={24} color="#a87133" />
            ) : (
              <Text style={styles.leaderboardRank}>{index + 1}</Text>
            )}
          </View>
          <Text style={styles.leaderboardName}>{user.name}</Text>
          <Text style={styles.leaderboardDays}> {user.days} ngày</Text>
        </View>
      ))}
    </LinearGradient>
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
  const [successStories] = useState(getSuccessStories());
  const [healthBenefits] = useState(getHealthBenefits());
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isSearchOrFilterActive, setIsSearchOrFilterActive] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    // Initialize comments state with comments from posts
    const initialComments = posts.reduce((acc, post) => {
      if (post.comments && post.comments.length > 0) {
        acc[post.id] = post.comments;
      }
      return acc;
    }, {});
    setComments(initialComments);
  }, [posts]);

  useEffect(() => {
    // Update isSearchOrFilterActive based on searchQuery and filter
    if (searchQuery.trim() || filter === "withImage") {
      setIsSearchOrFilterActive(true);
    } else {
      setIsSearchOrFilterActive(false);
    }
  }, [searchQuery, filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const mockPosts = await getPosts();
      setPosts(mockPosts);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setLoading(false);
      setError("Không thể tải bài viết");
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const mockLeaderboard = [
        { rank: 1, name: "user1", days: 100 },
        { rank: 2, name: "user2", days: 95 },
        { rank: 3, name: "user3", days: 90 },
        { rank: 4, name: "user4", days: 85 },
        { rank: 5, name: "user5", days: 80 },
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
      setComments((prev) => ({
        ...prev,
        [postId]: fetchedComments,
      }));
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
        const updatedPost = await updatePost(editingPost.id, {
          content: newPost.text,
          image: newPost.image,
        });
        setPosts(
          posts.map((post) =>
            post.id === editingPost.id
              ? { ...post, ...updatedPost, comments: post.comments } // Preserve existing comments
              : post
          )
        );
        setEditingPost(null);
      } else {
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
            setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
            setComments((prev) => {
              const newComments = { ...prev };
              delete newComments[id];
              return newComments;
            });
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
    setLoading(true);
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
      setComments((prev) => {
        const existingComments =
          prev[postId] || posts.find((p) => p.id === postId)?.comments || [];
        return {
          ...prev,
          [postId]: [...existingComments, createdComment],
        };
      });
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
    } finally {
      setLoading(false);
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

  const handleSharePost = (post) => {
    Alert.alert("Chia sẻ bài viết", "Bạn muốn chia sẻ bài viết này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Sao chép liên kết",
        onPress: () => {
          Alert.alert("Đã sao chép", "Liên kết bài viết đã được sao chép");
        },
      },
      {
        text: "Chia sẻ với bạn bè",
        onPress: () => {
          Alert.alert("Chia sẻ", "Mở trình chia sẻ của thiết bị...");
        },
      },
    ]);
  };

  const handleStoryChange = (index) => {
    setCurrentStoryIndex(index);
  };

  const handleSearchSubmit = () => {
    setIsSearchOrFilterActive(!!searchQuery.trim());
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "popular") {
      return matchesSearch && post.likes >= 10;
    }

    if (filter === "withImage") {
      return matchesSearch && post.image;
    }

    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <LinearGradient
          colors={["#0c019eff", "#175ffaff", "#33bdf4ff"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Cộng đồng cai thuốc🚬</Text>
          </View>

          <View style={styles.headerRight}>
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
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              placeholder="Tìm kiếm bài viết, người dùng..."
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
              onSubmitEditing={handleSearchSubmit}
            />
          </View>

          {/* Filter Buttons */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === "all" && styles.activeFilter,
              ]}
              onPress={() => setFilter("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "all" && styles.activeFilterText,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                {
                  filterButton: styles.filterButton,
                  activeFilter: filter === "withImage" && styles.activeFilter,
                },
              ]}
              onPress={() => setFilter("withImage")}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === "withImage" && styles.activeFilterText,
                ]}
              >
                Có hình ảnh
              </Text>
            </TouchableOpacity>
          </ScrollView>

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
                placeholderTextColor="#9ca3af"
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
                  style={[
                    styles.submitBtn,
                    loading && styles.submitBtnDisabled,
                  ]}
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
          ) : (
            <>
              {!isSearchOrFilterActive && (
                <>
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>
                      Lợi ích sức khỏe theo thời gian
                    </Text>
                    <FlatList
                      horizontal
                      data={healthBenefits}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <HealthBenefitCard item={item} />
                      )}
                      contentContainerStyle={styles.benefitsList}
                      showsHorizontalScrollIndicator={true}
                    />
                  </View>

                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Câu chuyện thành công
                      </Text>
                    </View>
                    <SuccessStoryCard
                      story={successStories[currentStoryIndex]}
                    />
                    <View style={styles.storyIndicators}>
                      {successStories.map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleStoryChange(index)}
                          style={{ pointerEvents: "auto" }}
                        >
                          <View
                            style={[
                              styles.storyIndicator,
                              index === currentStoryIndex &&
                                styles.activeIndicator,
                            ]}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <LeaderboardSection leaderboardData={leaderboard} />
                </>
              )}

              <Text style={[styles.sectionTitle, styles.postsTitle]}>
                Bài viết mới nhất
              </Text>

              {filteredPosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="find-in-page"
                    size={48}
                    color="#cbd5e1"
                  />
                  <Text style={styles.emptyText}>
                    Không tìm thấy bài viết phù hợp
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredPosts}
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
                      onComment={handleAddComment}
                      onImagePress={handleImageModal}
                      onShare={handleSharePost}
                    />
                  )}
                  contentContainerStyle={styles.postList}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalContainer, { pointerEvents: "auto" }]}
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
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#1f2937",
  },
  filterContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    color: "#4b5563",
    fontSize: 14,
  },
  activeFilter: {
    backgroundColor: "#3b82f6",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "500",
  },
  createPostForm: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 15,
    borderRadius: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
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
    minHeight: 100,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#f9fafb",
    marginBottom: 10,
    fontSize: 16,
    color: "#1f2937",
    textAlignVertical: "top",
  },
  previewImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 15,
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
    borderRadius: 10,
  },
  imageBtnText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
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
    paddingHorizontal: 15,
  },
  postCard: {
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#dbeafe",
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
    paddingBottom: 5,
    lineHeight: 22,
  },
  readMore: {
    color: "#3b82f6",
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  postFooter: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
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
    padding: 15,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  comment: {
    flexDirection: "row",
    marginBottom: 15,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  commentAuthor: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1f2937",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  commentTimestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  viewAllComments: {
    color: "#3b82f6",
    fontSize: 14,
    marginBottom: 10,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  commentInput: {
    flex: 1,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#1f2937",
  },
  commentButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
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
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "95%",
    height: "80%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 15,
    padding: 15,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  postsTitle: {
    marginLeft: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  benefitsList: {
    paddingVertical: 5,
  },
  benefitCard: {
    width: 180,
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  benefitIcon: {
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0ea5e9",
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
  },
  storyCard: {
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  storyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#bbf7d0",
  },
  storyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#15803d",
  },
  storyDays: {
    fontSize: 14,
    color: "#4b5563",
  },
  storyText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 15,
  },
  storyFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  savingsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  savingsText: {
    fontSize: 13,
    color: "#15803d",
    marginLeft: 5,
  },
  storyIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  storyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#3b82f6",
    width: 12,
  },
  leaderboardContainer: {
    borderRadius: 16,
    padding: 20,
    margin: 15,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  firstPlace: {
    backgroundColor: "#fef9c3",
  },
  secondPlace: {
    backgroundColor: "#f3f4f6",
  },
  thirdPlace: {
    backgroundColor: "#f5d0fe",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 10,
  },
  leaderboardDays: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  rightAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 16,
  },
});
