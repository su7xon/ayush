import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { ReactionBar } from '@/components/feed/ReactionBar';
import { PollComponent } from '@/components/feed/PollComponent';
import { RumorComponent } from '@/components/feed/RumorComponent';
import { ChallengeComponent } from '@/components/feed/ChallengeComponent';
import { Post, ReactionType } from '@/services/supabase';
import { theme, getCategoryColor } from '@/constants/theme';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, reactionType: ReactionType) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onUserPress: (userId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReaction,
  onComment,
  onShare,
  onUserPress,
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState(1);

  const categoryColor = getCategoryColor(post.category);
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${post.category} on TEA-TIME: ${post.content.substring(0, 100)}...`,
        url: `teatime://post/${post.id}`,
      });
      onShare(post.id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderCategoryTag = () => (
    <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
      <Text style={styles.categoryText}>
        #{post.category.toUpperCase()}
      </Text>
    </View>
  );

  const renderTrendingBadge = () => {
    if (!post.is_trending) return null;
    
    return (
      <View style={styles.trendingBadge}>
        <Text style={styles.trendingText}>🔥 TRENDING</Text>
      </View>
    );
  };

  const renderMediaContent = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        {post.media_urls.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={[
              styles.mediaImage,
              {
                height: (screenWidth - theme.spacing[8]) / imageAspectRatio,
              },
            ]}
            resizeMode="cover"
            onLoad={(event) => {
              const { width, height } = event.nativeEvent.source;
              setImageAspectRatio(width / height);
            }}
          />
        ))}
      </View>
    );
  };

  const renderSpecialContent = () => {
    switch (post.category) {
      case 'poll':
        return post.poll ? <PollComponent poll={post.poll} /> : null;
      case 'rumor':
        return post.rumor ? <RumorComponent rumor={post.rumor} /> : null;
      case 'challenge':
        return post.challenge ? <ChallengeComponent challenge={post.challenge} /> : null;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTrendingBadge()}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => onUserPress(post.user_id)}
        >
          <Avatar
            seed={post.user?.anonymous_avatar_seed}
            username={post.user?.anonymous_username}
            size="md"
          />
          <View style={styles.userDetails}>
            <Text style={styles.username}>
              {post.user?.anonymous_username || 'Anonymous'}
            </Text>
            <View style={styles.metaInfo}>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={[styles.teaRank, { color: categoryColor }]}>
                {post.user?.tea_rank || 'Tea Newbie'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {renderCategoryTag()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {post.title && (
          <Text style={styles.title}>{post.title}</Text>
        )}
        <Text style={styles.postContent}>{post.content}</Text>
        
        {renderMediaContent()}
        {renderSpecialContent()}
      </View>

      {/* Interaction Bar */}
      <ReactionBar
        post={post}
        onReaction={onReaction}
        onComment={onComment}
        onShare={handleShare}
      />
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.components.post.borderRadius,
    marginHorizontal: theme.components.post.marginHorizontal,
    marginBottom: theme.components.post.marginBottom,
    padding: theme.components.post.padding,
    ...theme.shadows.sm,
  },
  
  trendingBadge: {
    position: 'absolute' as const,
    top: -6,
    right: theme.spacing[4],
    backgroundColor: theme.colors.tea.trending,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },
  
  trendingText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing[3],
  },
  
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  
  userDetails: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },
  
  username: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  
  metaInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  timeAgo: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  separator: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing[2],
  },
  
  teaRank: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  categoryTag: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  
  categoryText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  content: {
    marginBottom: theme.spacing[4],
  },
  
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
    lineHeight: theme.typography.lineHeight.tight * theme.typography.fontSize.lg,
  },
  
  postContent: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing[3],
  },
  
  mediaContainer: {
    marginTop: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden' as const,
  },
  
  mediaImage: {
    width: '100%',
    marginBottom: theme.spacing[2],
  },
};