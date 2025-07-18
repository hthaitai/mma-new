import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";

const PostForm = ({ onSubmit }) => {
  const [text, setText] = useState("");

  const handlePost = () => {
    if (text.trim() !== "") {
      onSubmit(text);
      setText("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Bạn đang nghĩ gì?"
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity style={styles.button} onPress={handlePost}>
        <Text style={styles.buttonText}>Đăng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "#e0f2f1",
    padding: 12,
    borderRadius: 12,
  },
  input: {
    minHeight: 60,
    borderColor: "#90caf9",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PostForm;
