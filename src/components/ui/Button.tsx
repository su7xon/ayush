import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      height: theme.components.button.height[size],
      borderRadius: theme.components.button.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing[size === 'sm' ? 4 : size === 'md' ? 6 : 8],
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.primary[500],
          ...theme.shadows.sm,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.secondary[500],
          ...theme.shadows.sm,
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        };
      case 'gradient':
        return {
          ...baseStyles,
          ...theme.shadows.sm,
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyles: TextStyle = {
      fontSize: theme.components.button.fontSize[size],
      fontWeight: theme.typography.fontWeight.semibold,
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyles,
          color: theme.colors.text.inverse,
        };
      case 'outline':
        return {
          ...baseStyles,
          color: theme.colors.primary[500],
        };
      case 'ghost':
        return {
          ...baseStyles,
          color: theme.colors.text.primary,
        };
      case 'gradient':
        return {
          ...baseStyles,
          color: theme.colors.text.inverse,
        };
      default:
        return baseStyles;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[500] : theme.colors.text.inverse}
          style={{ marginRight: leftIcon || children ? theme.spacing[2] : 0 }}
        />
      ) : (
        leftIcon && (
          <React.Fragment>
            {leftIcon}
            <Text style={{ width: theme.spacing[2] }} />
          </React.Fragment>
        )
      )}
      
      {typeof children === 'string' ? (
        <Text style={getTextStyles()}>{children}</Text>
      ) : (
        children
      )}
      
      {rightIcon && !loading && (
        <React.Fragment>
          <Text style={{ width: theme.spacing[2] }} />
          {rightIcon}
        </React.Fragment>
      )}
    </>
  );

  const buttonStyle = [
    getButtonStyles(),
    disabled && { opacity: 0.6 },
    style,
  ];

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};