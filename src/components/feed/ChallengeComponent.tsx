import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Challenge, ChallengeResponse } from '@/services/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { theme } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';

interface ChallengeComponentProps {
  challenge: Challenge;
  onRespond?: (responseText: string) => void;
}

export const ChallengeComponent: React.FC<ChallengeComponentProps> = ({
  challenge,
  onRespond,
}) => {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showAllResponses, setShowAllResponses] = useState(false);

  const isExpired = challenge.expires_at && new Date(challenge.expires_at) < new Date();
  const canRespond = !isExpired && onRespond;

  const handleSubmitResponse = () => {
    if (responseText.trim() && onRespond) {
      onRespond(responseText.trim());
      setResponseText('');
      setShowResponseModal(false);
    }
  };

  const getChallengeTypeColor = () => {
    switch (challenge.challenge_type) {
      case 'confession':
        return theme.colors.accent[500];
      case 'dare':
        return theme.colors.tea.trending;
      case 'story':
        return theme.colors.secondary[500];
      default:
        return theme.colors.primary[500];
    }
  };

  const getChallengeTypeIcon = () => {
    switch (challenge.challenge_type) {
      case 'confession':
        return '🤫';
      case 'dare':
        return '🎯';
      case 'story':
        return '📖';
      default:
        return '💭';
    }
  };

  const renderResponse = (response: ChallengeResponse, index: number) => (
    <View key={response.id} style={[
      styles.responseCard,
      response.is_featured && styles.featuredResponse,
    ]}>
      {response.is_featured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>⭐ Featured</Text>
        </View>
      )}
      
      <View style={styles.responseHeader}>
        <Avatar
          seed={response.user?.anonymous_avatar_seed}
          username={response.user?.anonymous_username}
          size="sm"
        />
        <View style={styles.responseUserInfo}>
          <Text style={styles.responseUsername}>
            {response.user?.anonymous_username || `Anonymous${index + 1}`}
          </Text>
          <Text style={styles.responseTime}>
            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
          </Text>
        </View>
        <View style={styles.responseLikes}>
          <Text style={styles.likesIcon}>❤️</Text>
          <Text style={styles.likesCount}>{response.likes_count}</Text>
        </View>
      </View>
      
      <Text style={styles.responseText}>{response.response_text}</Text>
    </View>
  );

  const displayResponses = showAllResponses 
    ? challenge.responses || []
    : (challenge.responses || []).slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.challengeIcon}>{getChallengeTypeIcon()}</Text>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>
            {challenge.challenge_type.charAt(0).toUpperCase() + challenge.challenge_type.slice(1)} Challenge
          </Text>
          <View style={styles.challengeMeta}>
            <Text style={styles.participantCount}>
              {challenge.participants_count} participant{challenge.participants_count !== 1 ? 's' : ''}
            </Text>
            {challenge.is_trending && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.trendingText}>🔥 Trending</Text>
              </>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.challengeText}>{challenge.challenge_text}</Text>

      {challenge.expires_at && (
        <Text style={[
          styles.expiryText,
          isExpired && styles.expiredText,
        ]}>
          {isExpired
            ? 'Challenge ended'
            : `Ends ${formatDistanceToNow(new Date(challenge.expires_at), { addSuffix: true })}`
          }
        </Text>
      )}

      <View style={styles.actionSection}>
        <Button
          variant="gradient"
          size="md"
          onPress={() => setShowResponseModal(true)}
          disabled={!canRespond}
          fullWidth
        >
          {canRespond ? 'Accept Challenge' : 'Challenge Ended'}
        </Button>
      </View>

      {challenge.responses && challenge.responses.length > 0 && (
        <View style={styles.responsesSection}>
          <Text style={styles.responsesHeader}>Responses</Text>
          
          {displayResponses.map((response, index) => renderResponse(response, index))}
          
          {challenge.responses.length > 3 && !showAllResponses && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllResponses(true)}
            >
              <Text style={styles.showMoreText}>
                Show {challenge.responses.length - 3} more response{challenge.responses.length - 3 !== 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
          
          {showAllResponses && challenge.responses.length > 3 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllResponses(false)}
            >
              <Text style={styles.showMoreText}>Show less</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Response Modal */}
      <Modal
        visible={showResponseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResponseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowResponseModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Respond to Challenge</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.challengePreview}>
              "{challenge.challenge_text}"
            </Text>

            <TextInput
              style={styles.responseInput}
              placeholder="Share your response anonymously..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <Text style={styles.anonymousNote}>
              💡 Your response will be posted anonymously
            </Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleSubmitResponse}
              disabled={!responseText.trim()}
              fullWidth
            >
              Post Response
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: {
    marginTop: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.secondary[50],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[3],
  },

  challengeIcon: {
    fontSize: theme.typography.fontSize['2xl'],
    marginRight: theme.spacing[3],
  },

  challengeInfo: {
    flex: 1,
  },

  challengeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },

  challengeMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: theme.spacing[1],
  },

  participantCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  separator: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginHorizontal: theme.spacing[2],
  },

  trendingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.tea.trending,
    fontWeight: theme.typography.fontWeight.medium,
  },

  challengeText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.lg,
    marginBottom: theme.spacing[3],
  },

  expiryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing[3],
  },

  expiredText: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },

  actionSection: {
    marginBottom: theme.spacing[4],
  },

  responsesSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing[4],
  },

  responsesHeader: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },

  responseCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    ...theme.shadows.sm,
  },

  featuredResponse: {
    borderWidth: 1,
    borderColor: theme.colors.tea.featured,
  },

  featuredBadge: {
    position: 'absolute' as const,
    top: -8,
    right: theme.spacing[3],
    backgroundColor: theme.colors.tea.featured,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },

  featuredText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  responseHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[2],
  },

  responseUserInfo: {
    flex: 1,
    marginLeft: theme.spacing[2],
  },

  responseUsername: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },

  responseTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },

  responseLikes: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  likesIcon: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing[1],
  },

  likesCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },

  responseText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  showMoreButton: {
    padding: theme.spacing[2],
    alignItems: 'center' as const,
  },

  showMoreText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },

  cancelButton: {
    padding: theme.spacing[2],
  },

  cancelText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
  },

  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },

  placeholder: {
    width: 60,
  },

  modalContent: {
    flex: 1,
    padding: theme.spacing[4],
  },

  challengePreview: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontStyle: 'italic' as const,
    marginBottom: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },

  responseInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    minHeight: 120,
    marginBottom: theme.spacing[3],
  },

  anonymousNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },

  modalFooter: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
};