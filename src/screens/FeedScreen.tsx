import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PostCard } from '@/components/feed/PostCard';
import { Post, ReactionType, TeaTimeService } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';

export const FeedScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'trending'>('feed');

  const loadPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!user?.college_id) return;

    try {
      setLoading(pageNum === 0 && !append);
      
      let data: Post[] = [];
      let error: any = null;

      if (selectedTab === 'feed') {
        const result = await TeaTimeService.getFeed(user.college_id, pageNum);
        data = result.data || [];
        error = result.error;
      } else {
        const result = await TeaTimeService.getTrendingPosts(user.college_id);
        data = result.data || [];
        error = result.error;
      }

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      if (append) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
      }

      setHasMore(data.length === 20); // Assuming 20 is the page limit
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.college_id, selectedTab]);

  useEffect(() => {
    loadPosts(0);
  }, [loadPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadPosts(0);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && selectedTab === 'feed') {
      loadPosts(page + 1, true);
    }
  };

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user) return;

    try {
      // Optimistically update UI
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const hasExistingReaction = post.user_reaction;
          const isRemoving = post.user_reaction === reactionType;
          
          return {
            ...post,
            user_reaction: isRemoving ? undefined : reactionType,
            likes_count: isRemoving 
              ? post.likes_count - 1 
              : hasExistingReaction 
                ? post.likes_count 
                : post.likes_count + 1,
          };
        }
        return post;
      }));

      // Check if removing existing reaction
      const post = posts.find(p => p.id === postId);
      if (post?.user_reaction === reactionType) {
        await TeaTimeService.removeReaction(postId, user.id);
      } else {
        await TeaTimeService.addReaction(postId, user.id, reactionType);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert optimistic update on error
      loadPosts(0);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to comments modal/screen
    console.log('Navigate to comments for post:', postId);
  };

  const handleShare = async (postId: string) => {
    // Handle sharing logic
    console.log('Share post:', postId);
  };

  const handleUserPress = (userId: string) => {
    // Navigate to anonymous user profile
    console.log('View user profile:', userId);
  };

  const handleTabChange = (tab: 'feed' | 'trending') => {
    if (tab !== selectedTab) {
      setSelectedTab(tab);
      setPage(0);
      setPosts([]);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onReaction={handleReaction}
      onComment={handleComment}
      onShare={handleShare}
      onUserPress={handleUserPress}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={theme.colors.gradients.background}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>TEA-TIME</Text>
          <Text style={styles.headerSubtitle}>
            {user?.college?.name || 'Your Campus'}
          </Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'feed' && styles.activeTab,
            ]}
            onPress={() => handleTabChange('feed')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'feed' && styles.activeTabText,
            ]}>
              Latest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'trending' && styles.activeTab,
            ]}
            onPress={() => handleTabChange('trending')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'trending' && styles.activeTabText,
            ]}>
              🔥 Trending
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>☕</Text>
      <Text style={styles.emptyTitle}>No tea to spill yet!</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share some campus gossip or confessions
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 0) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more tea... ☕</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  
  header: {
    marginBottom: theme.spacing[4],
  },
  
  headerGradient: {
    paddingTop: theme.spacing[12], // Account for status bar
    paddingBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
  
  headerContent: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  
  headerTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[1],
    ...theme.shadows.sm,
  },
  
  tab: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  
  activeTab: {
    backgroundColor: theme.colors.primary[500],
  },
  
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  
  listContainer: {
    paddingBottom: theme.spacing[10],
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing[16],
    paddingHorizontal: theme.spacing[8],
  },
  
  emptyEmoji: {
    fontSize: theme.typography.fontSize['5xl'],
    marginBottom: theme.spacing[4],
  },
  
  emptyTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  
  emptySubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  loadingFooter: {
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
});