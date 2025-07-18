import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const CommentModal = ({ visible, onClose, post, onAddComment }) => {
  const [comment, setComment] = useState("");

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modal}>
        <Text style={styles.title}>Bình luận</Text>
        <FlatList
          data={post.comments}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Text style={styles.commentItem}>- {item}</Text>
          )}
        />
        <TextInput
          placeholder="Viết bình luận..."
          style={styles.input}
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (comment.trim()) {
              onAddComment(post.id, comment);
              setComment("");
            }
          }}
        >
          <Text style={styles.buttonText}>Gửi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.close}>
          <Text style={{ color: "#007aff" }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  commentItem: { paddingVertical: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#2196f3",
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  close: { marginTop: 20, alignItems: "center" },
});

export default CommentModal;
