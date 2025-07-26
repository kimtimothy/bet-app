import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';

interface LoadingButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
  loading?: boolean;
  /**
   * Additional Tailwind CSS classes to apply to the button.  Should
   * include background colour, padding and border radius.  Colour
   * contrast should ensure readability on all platforms.
   */
  className?: string;
}

/**
 * A reusable button component that shows a spinner when an async
 * operation is in progress.  Using this helper keeps button styling
 * consistent across the app and avoids duplicated logic in each screen.
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({ label, onPress, loading = false, className = '' }) => {
  return (
    <Pressable
      className={`${className} ${loading ? 'opacity-60' : ''}`}
      disabled={loading}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className="text-white text-center font-medium">{label}</Text>
      )}
    </Pressable>
  );
};

export default LoadingButton;