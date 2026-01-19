import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  colors?: [string, string, ...string[]];
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  colors = [COLORS.gradientPrimaryStart, COLORS.gradientPrimaryEnd],
  containerStyle,
  textStyle,
  isLoading = false,
  disabled = false,
  icon,
}) => {
  const isEnabled = !isLoading && !disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={isEnabled ? onPress : undefined}
      disabled={!isEnabled}
      style={[styles.touchable, containerStyle]}
    >
      <LinearGradient
        colors={disabled ? [COLORS.glassBorder, COLORS.glassBorder] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, !isEnabled && styles.disabled]}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.textPrimary} />
        ) : (
          <>
            {icon && icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.glow,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: 8, // gap for icon
  },
});
