import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const CommunityPostCard = ({ post, onLike, onComment, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{post.username}</Text>
        {post.username === "me" && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Xác nhận", "Xoá bài viết này?", [
                { text: "Huỷ" },
                { text: "Xoá", onPress: () => onDelete(post.id) },
              ]);
            }}
          >
            <Text style={styles.delete}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onLike(post.id)}
          style={styles.iconGroup}
        >
          <FontAwesome name="thumbs-up" size={16} color="#555" />
          <Text style={styles.iconText}> {post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onComment(post)}
          style={styles.iconGroup}
        >
          <FontAwesome name="comment" size={16} color="#555" />
          <Text style={styles.iconText}> {post.comments.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fdfdfd",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 16, flex: 1 },
  delete: { fontSize: 18, color: "#e53935" },
  content: { marginTop: 6, marginBottom: 10 },
  footer: { flexDirection: "row", gap: 24 },
  iconGroup: { flexDirection: "row", alignItems: "center" },
  iconText: { marginLeft: 6 },
});

export default CommunityPostCard;
