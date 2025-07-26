import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  style?: any;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ label, onPress, loading = false, style }) => {
  return (
    <Pressable
      style={[styles.button, style, loading && styles.disabled]}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoadingButton;