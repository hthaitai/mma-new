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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SmokingForm({ visible, onSubmit, onClose }) {
    const [cigarettesPerDay, setCigarettesPerDay] = useState('');
    const [costPerPack, setCostPerPack] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSave = () => {
        onSubmit({
            cigarettes_per_day: Number(cigarettesPerDay),
            cost_per_pack: Number(costPerPack),
            start_date: startDate.toISOString(),
        });
        // Reset
        setCigarettesPerDay('');
        setCostPerPack('');
        setStartDate(new Date());
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Tình trạng hút thuốc</Text>

                    <Text style={styles.label}>Số điếu/ngày:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: 10"
                        keyboardType="numeric"
                        value={cigarettesPerDay}
                        onChangeText={setCigarettesPerDay}
                    />

                    <Text style={styles.label}>Giá 1 bao (VND):</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: 20000"
                        keyboardType="numeric"
                        value={costPerPack}
                        onChangeText={setCostPerPack}
                    />

                    <Text style={styles.label}>Ngày bắt đầu:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text>{startDate.toLocaleDateString('vi-VN')}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setStartDate(selectedDate);
                            }}
                        />
                    )}

                    <View style={styles.buttonRow}>
                        <Button title="Hủy" onPress={onClose} />
                        <Button title="Lưu" onPress={handleSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    container: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 18,
        elevation: 8,
        shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
    },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 18, color: '#007bff', textAlign: 'center' },
    label: { fontSize: 15, marginTop: 12, marginBottom: 4, color: '#333', fontWeight: '500' },
    input: {
        borderWidth: 1, borderColor: '#b3d1fa',
        borderRadius: 8, padding: 12,
        backgroundColor: '#f7fbff',
        fontSize: 15,
        marginBottom: 2,
    },
    dateButton: {
        borderWidth: 1, borderColor: '#b3d1fa',
        borderRadius: 8, padding: 12,
        backgroundColor: '#eaf3fc',
        marginBottom: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 28,
    },
    button: {
        flex: 1,
        marginHorizontal: 6,
        backgroundColor: '#007bff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 10,
    },
});
