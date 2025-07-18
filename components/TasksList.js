import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TasksList = ({ tasks, onTaskComplete }) => {
  return (
    <View style={styles.tasksCard}>
      <Text style={styles.cardTitle}>✅ Nhiệm vụ sắp tới</Text>
      
      {tasks.map((task, index) => (
        <View key={task._id || index} style={styles.taskItem}>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
            {task.due_date && (
              <Text style={styles.taskDueDate}>
                📅 Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.completeButton, task.completed && styles.completedButton]}
            onPress={() => onTaskComplete(task._id)}
            disabled={task.completed}
          >
            <Text style={[styles.completeButtonText, task.completed && styles.completedButtonText]}>
              {task.completed ? '✓ Hoàn thành' : 'Hoàn thành'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {tasks.length === 0 && (
        <Text style={styles.emptyTasksText}>🎉 Không có nhiệm vụ nào! Bạn đang làm rất tốt!</Text>
      )}
    </View>
  );
};

export default TasksList;

const styles = StyleSheet.create({
  tasksCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  taskContent: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 18,
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#6c757d',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  completedButtonText: {
    color: '#fff',
  },
  emptyTasksText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#28a745',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});