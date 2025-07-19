import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface College {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  location?: string;
  student_count?: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  college_id: string;
  email: string;
  anonymous_username: string;
  anonymous_avatar_seed?: string;
  tea_points: number;
  tea_rank: string;
  is_verified: boolean;
  is_banned: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
  college?: College;
}

export interface Post {
  id: string;
  user_id: string;
  college_id: string;
  category: 'confession' | 'poll' | 'tea' | 'rumor' | 'challenge' | 'general';
  title?: string;
  content: string;
  media_urls?: string[];
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_trending: boolean;
  is_featured: boolean;
  is_reported: boolean;
  report_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  poll?: Poll;
  rumor?: Rumor;
  challenge?: Challenge;
  user_reaction?: ReactionType;
}

export interface Poll {
  id: string;
  post_id: string;
  expires_at?: string;
  total_votes: number;
  created_at: string;
  options: PollOption[];
  user_vote?: string; // option_id user voted for
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes_count: number;
  order_index: number;
  created_at: string;
}

export interface Rumor {
  id: string;
  post_id: string;
  rumor_text: string;
  believe_count: number;
  doubt_count: number;
  total_votes: number;
  credibility_score: number;
  created_at: string;
  user_vote?: boolean; // true = believe, false = doubt
}

export interface Challenge {
  id: string;
  post_id: string;
  challenge_text: string;
  challenge_type: 'confession' | 'dare' | 'story';
  participants_count: number;
  is_trending: boolean;
  expires_at?: string;
  created_at: string;
  responses?: ChallengeResponse[];
}

export interface ChallengeResponse {
  id: string;
  challenge_id: string;
  user_id: string;
  response_text: string;
  likes_count: number;
  is_featured: boolean;
  created_at: string;
  user?: User;
}

export type ReactionType = 'like' | 'laugh' | 'shocked' | 'angry' | 'fire' | 'eyes';

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  replies_count: number;
  is_reported: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
  user_reaction?: ReactionType;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'post_liked' | 'post_commented' | 'comment_liked' | 'post_trending' | 
        'challenge_response' | 'poll_voted' | 'rumor_update' | 'tea_rank_up';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface TrendingTopic {
  id: string;
  college_id: string;
  topic: string;
  mention_count: number;
  trend_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Service functions
export class TeaTimeService {
  // Authentication
  static async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // User management
  static async createUserProfile(userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select('*, college(*)')
      .single();
    return { data, error };
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, college(*)')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  static async updateUserProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*, college(*)')
      .single();
    return { data, error };
  }

  // Colleges
  static async getColleges() {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_verified', true)
      .order('name');
    return { data, error };
  }

  static async getCollegeByDomain(domain: string) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('domain', domain)
      .single();
    return { data, error };
  }

  // Posts
  static async getFeed(collegeId: string, page: number = 0, limit: number = 20) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank),
        poll:polls(*,
          options:poll_options(*)
        ),
        rumor:rumors(*),
        challenge:challenges(*)
      `)
      .eq('college_id', collegeId)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);
    return { data, error };
  }

  static async getTrendingPosts(collegeId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
      `)
      .eq('college_id', collegeId)
      .eq('is_trending', true)
      .order('likes_count', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  static async createPost(postData: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
      `)
      .single();
    return { data, error };
  }

  // Reactions
  static async addReaction(postId: string, userId: string, reactionType: ReactionType) {
    const { data, error } = await supabase
      .from('reactions')
      .upsert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      })
      .select()
      .single();
    return { data, error };
  }

  static async removeReaction(postId: string, userId: string) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return { error };
  }

  // Comments
  static async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank),
        replies:comments!parent_comment_id(
          *,
          user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  static async createComment(commentData: Partial<Comment>) {
    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
      `)
      .single();
    return { data, error };
  }

  // Polls
  static async createPoll(postId: string, options: string[], expiresAt?: string) {
    // First create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        post_id: postId,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (pollError) return { data: null, error: pollError };

    // Then create poll options
    const optionsData = options.map((option, index) => ({
      poll_id: poll.id,
      option_text: option,
      order_index: index,
    }));

    const { data: pollOptions, error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)
      .select();

    return { data: { poll, options: pollOptions }, error: optionsError };
  }

  static async votePoll(pollId: string, optionId: string, userId: string) {
    const { data, error } = await supabase
      .from('poll_votes')
      .upsert({
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: userId,
      })
      .select()
      .single();
    return { data, error };
  }

  // Rumors
  static async createRumor(postId: string, rumorText: string) {
    const { data, error } = await supabase
      .from('rumors')
      .insert({
        post_id: postId,
        rumor_text: rumorText,
      })
      .select()
      .single();
    return { data, error };
  }

  static async voteRumor(rumorId: string, userId: string, believes: boolean) {
    const { data, error } = await supabase
      .from('rumor_votes')
      .upsert({
        rumor_id: rumorId,
        user_id: userId,
        believes,
      })
      .select()
      .single();
    return { data, error };
  }

  // Challenges
  static async createChallenge(postId: string, challengeText: string, challengeType: string, expiresAt?: string) {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        post_id: postId,
        challenge_text: challengeText,
        challenge_type: challengeType,
        expires_at: expiresAt,
      })
      .select()
      .single();
    return { data, error };
  }

  static async respondToChallenge(challengeId: string, userId: string, responseText: string) {
    const { data, error } = await supabase
      .from('challenge_responses')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        response_text: responseText,
      })
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
      `)
      .single();
    return { data, error };
  }

  // Notifications
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { data, error };
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  }

  // Trending topics
  static async getTrendingTopics(collegeId: string) {
    const { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('college_id', collegeId)
      .eq('is_active', true)
      .order('trend_score', { ascending: false })
      .limit(10);
    return { data, error };
  }

  // Search
  static async searchPosts(collegeId: string, query: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!inner(anonymous_username, anonymous_avatar_seed, tea_rank)
      `)
      .eq('college_id', collegeId)
      .or(`content.ilike.%${query}%, title.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    return { data, error };
  }
}