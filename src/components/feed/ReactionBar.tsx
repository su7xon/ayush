import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import { Post, ReactionType } from '@/services/supabase';
import { theme, getReactionColor } from '@/constants/theme';

interface ReactionBarProps {
  post: Post;
  onReaction: (postId: string, reactionType: ReactionType) => void;
  onComment: () => void;
  onShare: () => void;
}

const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  laugh: '😂',
  shocked: '😱',
  angry: '😠',
  fire: '🔥',
  eyes: '👀',
};

const reactionLabels: Record<ReactionType, string> = {
  like: 'Like',
  laugh: 'LOL',
  shocked: 'Shocked',
  angry: 'Angry',
  fire: 'Fire',
  eyes: 'Eyes',
};

export const ReactionBar: React.FC<ReactionBarProps> = ({
  post,
  onReaction,
  onComment,
  onShare,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleReactionPress = () => {
    if (showReactions) {
      hideReactions();
    } else {
      showReactionMenu();
    }
  };

  const showReactionMenu = () => {
    setShowReactions(true);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideReactions = () => {
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setShowReactions(false);
    });
  };

  const handleReaction = (reactionType: ReactionType) => {
    Vibration.vibrate(50);
    onReaction(post.id, reactionType);
    hideReactions();
  };

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const renderReactionMenu = () => {
    if (!showReactions) return null;

    const scale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        style={[
          styles.reactionMenu,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {Object.entries(reactionEmojis).map(([type, emoji]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reactionButton,
              post.user_reaction === type && {
                backgroundColor: getReactionColor(type),
                transform: [{ scale: 1.1 }],
              },
            ]}
            onPress={() => handleReaction(type as ReactionType)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    );
  };

  return (
    <View>
      {renderReactionMenu()}
      
      <View style={styles.container}>
        {/* Left side - Reaction button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            post.user_reaction && {
              backgroundColor: getReactionColor(post.user_reaction),
            },
          ]}
          onPress={handleReactionPress}
          onLongPress={showReactionMenu}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>
            {post.user_reaction ? reactionEmojis[post.user_reaction] : '👍'}
          </Text>
          <Text style={[
            styles.actionText,
            post.user_reaction && { color: theme.colors.text.inverse },
          ]}>
            {post.user_reaction ? reactionLabels[post.user_reaction] : 'React'}
          </Text>
          {post.likes_count > 0 && (
            <Text style={[
              styles.countText,
              post.user_reaction && { color: theme.colors.text.inverse },
            ]}>
              {formatCount(post.likes_count)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Middle - Comment button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
          {post.comments_count > 0 && (
            <Text style={styles.countText}>
              {formatCount(post.comments_count)}
            </Text>
          )}
        </TouchableOpacity>

        {/* Right side - Share button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Share</Text>
          {post.shares_count > 0 && (
            <Text style={styles.countText}>
              {formatCount(post.shares_count)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  
  reactionMenu: {
    position: 'absolute' as const,
    bottom: '100%',
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    backgroundColor: theme.colors.background.card,
    marginBottom: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    ...theme.shadows.lg,
    zIndex: 1000,
  },
  
  reactionButton: {
    width: theme.components.reaction.size,
    height: theme.components.reaction.size,
    borderRadius: theme.components.reaction.size / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
  },
  
  reactionEmoji: {
    fontSize: theme.components.reaction.fontSize,
  },
  
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing[1],
  },
  
  actionIcon: {
    fontSize: theme.typography.fontSize.base,
    marginRight: theme.spacing[2],
  },
  
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  
  countText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
  },
};