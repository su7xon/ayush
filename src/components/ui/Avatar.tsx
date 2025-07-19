import React from 'react';
import { View, Text, Image, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface AvatarProps {
  seed?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  username?: string;
  imageUrl?: string;
  style?: ViewStyle;
}

// Generate consistent colors based on seed
const generateAvatarColor = (seed: string): string => {
  const colors = [
    theme.colors.primary[400],
    theme.colors.secondary[400],
    theme.colors.accent[400],
    theme.colors.navy[400],
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Generate avatar pattern/icon based on seed
const generateAvatarPattern = (seed: string): string => {
  const patterns = ['☕', '🌟', '🎭', '🦋', '🌙', '⭐', '🔥', '💫', '🌸', '🍃', '🌺', '🎪'];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return patterns[Math.abs(hash) % patterns.length];
};

export const Avatar: React.FC<AvatarProps> = ({
  seed = 'default',
  size = 'md',
  username,
  imageUrl,
  style,
}) => {
  const avatarSize = theme.components.avatar.size[size];
  const backgroundColor = generateAvatarColor(seed);
  const pattern = generateAvatarPattern(seed);
  
  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  };

  const textStyle = {
    fontSize: avatarSize * 0.4,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold as any,
  };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[avatarStyle, { backgroundColor: theme.colors.border.light }]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={avatarStyle}>
      {username ? (
        <Text style={textStyle}>
          {username.charAt(0).toUpperCase()}
        </Text>
      ) : (
        <Text style={[textStyle, { fontSize: avatarSize * 0.5 }]}>
          {pattern}
        </Text>
      )}
    </View>
  );
};