import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ImagePicker } from 'react-native-image-picker';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TeaTimeService } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { theme, getCategoryColor } from '@/constants/theme';

type PostCategory = 'confession' | 'poll' | 'tea' | 'rumor' | 'challenge' | 'general';

interface PollOption {
  id: string;
  text: string;
}

export const CreatePostScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [category, setCategory] = useState<PostCategory>('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUris, setMediaUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Poll specific
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [pollDuration, setPollDuration] = useState<number>(24); // hours
  
  // Challenge specific
  const [challengeType, setChallengeType] = useState<'confession' | 'dare' | 'story'>('confession');
  const [challengeDuration, setChallengeDuration] = useState<number>(7); // days

  const categories = [
    { id: 'general', name: 'General', emoji: '💬', description: 'General discussion' },
    { id: 'confession', name: 'Confession', emoji: '🤫', description: 'Anonymous confessions' },
    { id: 'tea', name: 'Tea', emoji: '☕', description: 'Juicy gossip' },
    { id: 'poll', name: 'Poll', emoji: '📊', description: 'Ask the community' },
    { id: 'rumor', name: 'Rumor', emoji: '🗣️', description: 'Campus rumors' },
    { id: 'challenge', name: 'Challenge', emoji: '🎯', description: 'Dare the community' },
  ];

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions(prev => [...prev, { id: Date.now().toString(), text: '' }]);
    }
  };

  const handleRemovePollOption = (id: string) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter(option => option.id !== id));
    }
  };

  const handlePollOptionChange = (id: string, text: string) => {
    setPollOptions(prev => prev.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const handleImagePicker = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'mixed',
        selectionLimit: 4,
        quality: 0.8,
      },
      (response) => {
        if (response.assets) {
          const uris = response.assets.map(asset => asset.uri).filter(Boolean) as string[];
          setMediaUris(prev => [...prev, ...uris].slice(0, 4));
        }
      }
    );
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUris(prev => prev.filter((_, i) => i !== index));
  };

  const validatePost = (): boolean => {
    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please add some content to your post.');
      return false;
    }

    if (category === 'poll') {
      const validOptions = pollOptions.filter(option => option.text.trim());
      if (validOptions.length < 2) {
        Alert.alert('Invalid Poll', 'Please add at least 2 poll options.');
        return false;
      }
    }

    if (category === 'rumor' && content.length < 20) {
      Alert.alert('Rumor Too Short', 'Rumors need more details to be credible.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validatePost() || !user) return;

    try {
      setLoading(true);

      // Create the main post
      const postData = {
        user_id: user.id,
        college_id: user.college_id,
        category,
        title: title.trim() || undefined,
        content: content.trim(),
        media_urls: mediaUris.length > 0 ? mediaUris : undefined,
        is_anonymous: true,
      };

      const { data: post, error: postError } = await TeaTimeService.createPost(postData);
      
      if (postError || !post) {
        throw new Error(postError?.message || 'Failed to create post');
      }

      // Handle category-specific data
      if (category === 'poll') {
        const validOptions = pollOptions.filter(option => option.text.trim()).map(option => option.text.trim());
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + pollDuration);
        
        await TeaTimeService.createPoll(post.id, validOptions, expiresAt.toISOString());
      }

      if (category === 'rumor') {
        await TeaTimeService.createRumor(post.id, content.trim());
      }

      if (category === 'challenge') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + challengeDuration);
        
        await TeaTimeService.createChallenge(
          post.id, 
          content.trim(), 
          challengeType, 
          expiresAt.toISOString()
        );
      }

      // Reset form
      setCategory('general');
      setTitle('');
      setContent('');
      setMediaUris([]);
      setPollOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
      setPollDuration(24);
      setChallengeType('confession');
      setChallengeDuration(7);

      Alert.alert('Success', 'Your anonymous post has been shared!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.categorySection}>
      <Text style={styles.sectionTitle}>Choose Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryCard,
              category === cat.id && {
                backgroundColor: getCategoryColor(cat.id),
                borderColor: getCategoryColor(cat.id),
              },
            ]}
            onPress={() => setCategory(cat.id as PostCategory)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={[
              styles.categoryName,
              category === cat.id && styles.selectedCategoryName,
            ]}>
              {cat.name}
            </Text>
            <Text style={[
              styles.categoryDescription,
              category === cat.id && styles.selectedCategoryDescription,
            ]}>
              {cat.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPollOptions = () => {
    if (category !== 'poll') return null;

    return (
      <View style={styles.pollSection}>
        <Text style={styles.sectionTitle}>Poll Options</Text>
        
        {pollOptions.map((option, index) => (
          <View key={option.id} style={styles.pollOptionRow}>
            <TextInput
              style={styles.pollOptionInput}
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChangeText={(text) => handlePollOptionChange(option.id, text)}
              maxLength={100}
            />
            {pollOptions.length > 2 && (
              <TouchableOpacity
                style={styles.removeOptionButton}
                onPress={() => handleRemovePollOption(option.id)}
              >
                <Text style={styles.removeOptionText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {pollOptions.length < 6 && (
          <TouchableOpacity style={styles.addOptionButton} onPress={handleAddPollOption}>
            <Text style={styles.addOptionText}>+ Add Option</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.pollDurationSection}>
          <Text style={styles.durationLabel}>Poll Duration:</Text>
          <View style={styles.durationButtons}>
            {[1, 6, 12, 24, 48].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.durationButton,
                  pollDuration === hours && styles.selectedDurationButton,
                ]}
                onPress={() => setPollDuration(hours)}
              >
                <Text style={[
                  styles.durationButtonText,
                  pollDuration === hours && styles.selectedDurationButtonText,
                ]}>
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderChallengeOptions = () => {
    if (category !== 'challenge') return null;

    return (
      <View style={styles.challengeSection}>
        <Text style={styles.sectionTitle}>Challenge Type</Text>
        
        <View style={styles.challengeTypeButtons}>
          {[
            { id: 'confession', name: 'Confession', emoji: '🤫' },
            { id: 'dare', name: 'Dare', emoji: '🎯' },
            { id: 'story', name: 'Story', emoji: '📖' },
          ].map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.challengeTypeButton,
                challengeType === type.id && styles.selectedChallengeTypeButton,
              ]}
              onPress={() => setChallengeType(type.id as typeof challengeType)}
            >
              <Text style={styles.challengeTypeEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.challengeTypeText,
                challengeType === type.id && styles.selectedChallengeTypeText,
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.challengeDurationSection}>
          <Text style={styles.durationLabel}>Challenge Duration:</Text>
          <View style={styles.durationButtons}>
            {[1, 3, 7, 14].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.durationButton,
                  challengeDuration === days && styles.selectedDurationButton,
                ]}
                onPress={() => setChallengeDuration(days)}
              >
                <Text style={[
                  styles.durationButtonText,
                  challengeDuration === days && styles.selectedDurationButtonText,
                ]}>
                  {days}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderMediaSection = () => (
    <View style={styles.mediaSection}>
      <Text style={styles.sectionTitle}>Media</Text>
      
      {mediaUris.length > 0 && (
        <ScrollView horizontal style={styles.mediaPreview}>
          {mediaUris.map((uri, index) => (
            <View key={index} style={styles.mediaItem}>
              <Image source={{ uri }} style={styles.mediaImage} />
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => handleRemoveMedia(index)}
              >
                <Text style={styles.removeMediaText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      
      {mediaUris.length < 4 && (
        <TouchableOpacity style={styles.addMediaButton} onPress={handleImagePicker}>
          <Text style={styles.addMediaIcon}>📷</Text>
          <Text style={styles.addMediaText}>Add Photos/Videos</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradients.background}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Spill the Tea</Text>
        <Text style={styles.headerSubtitle}>Share anonymously with your campus</Text>
        
        <View style={styles.anonymousPreview}>
          <Avatar
            seed={user?.anonymous_avatar_seed}
            username={user?.anonymous_username}
            size="md"
          />
          <View style={styles.anonymousInfo}>
            <Text style={styles.anonymousName}>
              {user?.anonymous_username || 'Anonymous'}
            </Text>
            <Text style={styles.anonymousRank}>
              {user?.tea_rank || 'Tea Newbie'}
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCategorySelector()}
        
        <View style={styles.inputSection}>
          {(category === 'confession' || category === 'tea' || category === 'challenge') && (
            <TextInput
              style={styles.titleInput}
              placeholder="Add a catchy title... (optional)"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          )}
          
          <TextInput
            style={styles.contentInput}
            placeholder={
              category === 'poll' 
                ? "Ask your question..."
                : category === 'rumor'
                ? "What's the rumor? Be detailed..."
                : category === 'challenge'
                ? "What's your challenge?"
                : "What's on your mind? Spill the tea..."
            }
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={category === 'rumor' ? 1000 : 500}
          />
          
          <Text style={styles.characterCount}>
            {content.length} / {category === 'rumor' ? 1000 : 500}
          </Text>
        </View>
        
        {renderPollOptions()}
        {renderChallengeOptions()}
        {renderMediaSection()}
        
        <View style={styles.footer}>
          <Text style={styles.anonymousNote}>
            🎭 Your identity remains completely anonymous
          </Text>
          
          <Button
            variant="gradient"
            size="lg"
            onPress={handleSubmit}
            loading={loading}
            disabled={!content.trim()}
            fullWidth
          >
            Share Anonymously
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  header: {
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
  
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  
  anonymousPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  
  anonymousInfo: {
    marginLeft: theme.spacing[3],
    flex: 1,
  },
  
  anonymousName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  
  anonymousRank: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[6],
  },
  
  categorySection: {
    marginVertical: theme.spacing[6],
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  
  categoryScroll: {
    marginHorizontal: -theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
  },
  
  categoryCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginRight: theme.spacing[3],
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  
  categoryEmoji: {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing[2],
  },
  
  categoryName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  
  selectedCategoryName: {
    color: theme.colors.text.inverse,
  },
  
  categoryDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  
  selectedCategoryDescription: {
    color: theme.colors.text.inverse,
  },
  
  inputSection: {
    marginBottom: theme.spacing[6],
  },
  
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.card,
    marginBottom: theme.spacing[3],
  },
  
  contentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.card,
    minHeight: 120,
    marginBottom: theme.spacing[2],
  },
  
  characterCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  
  // Poll styles
  pollSection: {
    marginBottom: theme.spacing[6],
  },
  
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  
  pollOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.card,
  },
  
  removeOptionButton: {
    marginLeft: theme.spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  removeOptionText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  addOptionButton: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
    marginBottom: theme.spacing[4],
  },
  
  addOptionText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  pollDurationSection: {
    marginTop: theme.spacing[3],
  },
  
  durationLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  durationButton: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    marginRight: theme.spacing[2],
    marginBottom: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  selectedDurationButton: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  
  durationButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  
  selectedDurationButtonText: {
    color: theme.colors.text.inverse,
  },
  
  // Challenge styles
  challengeSection: {
    marginBottom: theme.spacing[6],
  },
  
  challengeTypeButtons: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  
  challengeTypeButton: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    alignItems: 'center',
    marginRight: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  selectedChallengeTypeButton: {
    backgroundColor: theme.colors.secondary[500],
    borderColor: theme.colors.secondary[500],
  },
  
  challengeTypeEmoji: {
    fontSize: theme.typography.fontSize.lg,
    marginBottom: theme.spacing[1],
  },
  
  challengeTypeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  
  selectedChallengeTypeText: {
    color: theme.colors.text.inverse,
  },
  
  challengeDurationSection: {
    marginTop: theme.spacing[3],
  },
  
  // Media styles
  mediaSection: {
    marginBottom: theme.spacing[6],
  },
  
  mediaPreview: {
    marginBottom: theme.spacing[3],
  },
  
  mediaItem: {
    position: 'relative',
    marginRight: theme.spacing[3],
  },
  
  mediaImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  removeMediaText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  addMediaButton: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  
  addMediaIcon: {
    fontSize: theme.typography.fontSize['2xl'],
    marginBottom: theme.spacing[2],
  },
  
  addMediaText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  footer: {
    paddingVertical: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  
  anonymousNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    fontStyle: 'italic',
  },
});