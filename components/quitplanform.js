import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Modal,
    Platform,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function QuitPlanForm({
    visible,
    onSubmit,
    onClose,
    currentSmokingStatus,
    editMode = false,
    existingPlan = null
}) {
    const [planName, setPlanName] = useState(editMode && existingPlan ? existingPlan.name : '');
    const [startDate, setStartDate] = useState(() => {
        if (editMode && existingPlan) {
            return new Date(existingPlan.start_date);
        }
        return new Date();
    });
    const [targetQuitDate, setTargetQuitDate] = useState(() => {
        if (editMode && existingPlan) {
            return new Date(existingPlan.target_quit_date);
        }
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // Mặc định 30 ngày từ hôm nay
        return futureDate;
    });
    const [reason, setReason] = useState(editMode && existingPlan ? existingPlan.reason : '');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

    const handleSave = () => {
        if (!planName.trim()) {
            alert('Vui lòng nhập tên kế hoạch');
            return;
        }

        if (!reason.trim()) {
            alert('Vui lòng nhập lý do cai thuốc');
            return;
        }

        if (targetQuitDate <= startDate) {
            alert('Ngày mục tiêu phải sau ngày bắt đầu');
            return;
        }

        onSubmit({
            name: planName.trim(), // ✅ Thêm field name
            start_date: startDate.toISOString(),
            target_quit_date: targetQuitDate.toISOString(),
            reason: reason.trim(),
            smoking_status_id: currentSmokingStatus?._id || null,
        });
        
        // Reset form
        setPlanName('');
        setStartDate(new Date());
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        setTargetQuitDate(futureDate);
        setReason('');
        onClose();
    };

    const calculateDays = () => {
        const diffTime = Math.abs(targetQuitDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>
                            {editMode ? 'Chỉnh sửa kế hoạch cai thuốc' : 'Tạo kế hoạch cai thuốc'}
                        </Text>

                        {currentSmokingStatus && (
                            <View style={styles.currentInfoCard}>
                                <Text style={styles.currentInfoTitle}>Thông tin hiện tại:</Text>
                                <Text style={styles.currentInfoText}>
                                    Số điếu/ngày: {currentSmokingStatus.cigarettes_per_day}
                                </Text>
                                <Text style={styles.currentInfoText}>
                                    Giá 1 bao: {currentSmokingStatus.cost_per_pack.toLocaleString()} VND
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Tên kế hoạch *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ví dụ: Kế hoạch cai thuốc của tôi"
                            value={planName}
                            onChangeText={setPlanName}
                        />

                        <Text style={styles.label}>Ngày bắt đầu kế hoạch:</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {startDate.toLocaleDateString('vi-VN')}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Ngày mục tiêu hoàn toàn bỏ thuốc:</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowTargetDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>
                                {targetQuitDate.toLocaleDateString('vi-VN')}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.durationCard}>
                            <Text style={styles.durationText}>
                                Thời gian thực hiện: {calculateDays()} ngày
                            </Text>
                        </View>

                        <Text style={styles.label}>Lý do muốn cai thuốc:</Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Ví dụ: Vì sức khỏe, tiết kiệm tiền, cho gia đình..."
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowStartDatePicker(false);
                                    if (selectedDate) setStartDate(selectedDate);
                                }}
                            />
                        )}

                        {showTargetDatePicker && (
                            <DateTimePicker
                                value={targetQuitDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowTargetDatePicker(false);
                                    if (selectedDate) setTargetQuitDate(selectedDate);
                                }}
                            />
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>
                                    {editMode ? 'Cập nhật kế hoạch' : 'Tạo kế hoạch'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 18,
        elevation: 10,
        shadowColor: '#28a745',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#28a745',
        textAlign: 'center',
    },
    currentInfoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#007bff',
    },
    currentInfoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 4,
    },
    currentInfoText: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 2,
    },
    label: {
        fontSize: 16,
        marginTop: 12,
        marginBottom: 6,
        color: '#333',
        fontWeight: '600',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#28a745',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fff8',
        marginBottom: 4,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#28a745',
        fontWeight: '500',
    },
    durationCard: {
        backgroundColor: '#e8f5e8',
        borderRadius: 8,
        padding: 12,
        marginVertical: 12,
        alignItems: 'center',
    },
    durationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
    },
    input: {
        borderWidth: 1,
        borderColor: '#28a745',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fff8',
        fontSize: 16,
        marginBottom: 8,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#28a745',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fff8',
        fontSize: 16,
        minHeight: 80,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#6c757d',
        borderRadius: 8,
        paddingVertical: 12,
        elevation: 2,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#28a745',
        borderRadius: 8,
        paddingVertical: 12,
        elevation: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});