import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Rumor } from '@/services/supabase';
import { theme } from '@/constants/theme';

interface RumorComponentProps {
  rumor: Rumor;
  onVote?: (believes: boolean) => void;
}

export const RumorComponent: React.FC<RumorComponentProps> = ({
  rumor,
  onVote,
}) => {
  const [userVote, setUserVote] = useState(rumor.user_vote);
  const [animatedValue] = useState(new Animated.Value(0));

  const hasVoted = userVote !== undefined;
  const canVote = !hasVoted && onVote;

  const believePercentage = rumor.total_votes > 0 
    ? Math.round((rumor.believe_count / rumor.total_votes) * 100)
    : 0;
  
  const doubtPercentage = 100 - believePercentage;

  const handleVote = (believes: boolean) => {
    if (!canVote) return;

    setUserVote(believes);
    onVote(believes);

    // Animate credibility indicator
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getCredibilityLevel = (): { label: string; color: string; emoji: string } => {
    const score = rumor.credibility_score;
    
    if (score >= 0.8) return { label: 'Highly Credible', color: theme.colors.success, emoji: '✅' };
    if (score >= 0.6) return { label: 'Likely True', color: theme.colors.secondary[500], emoji: '👍' };
    if (score >= 0.4) return { label: 'Mixed Opinions', color: theme.colors.warning, emoji: '🤔' };
    if (score >= 0.2) return { label: 'Doubtful', color: theme.colors.accent[500], emoji: '🤨' };
    return { label: 'Highly Doubtful', color: theme.colors.error, emoji: '❌' };
  };

  const credibility = getCredibilityLevel();

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.rumorIcon}>🗣️</Text>
        <Text style={styles.rumorTitle}>Campus Rumor</Text>
        <Animated.View 
          style={[
            styles.credibilityBadge,
            { backgroundColor: credibility.color },
            hasVoted && { transform: [{ scale }] },
          ]}
        >
          <Text style={styles.credibilityEmoji}>{credibility.emoji}</Text>
          <Text style={styles.credibilityText}>{credibility.label}</Text>
        </Animated.View>
      </View>

      <Text style={styles.rumorText}>{rumor.rumor_text}</Text>

      <View style={styles.votingSection}>
        <Text style={styles.votingPrompt}>
          Do you believe this rumor?
        </Text>

        <View style={styles.votingButtons}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              styles.believeButton,
              userVote === true && styles.selectedBelieveButton,
              !canVote && styles.disabledButton,
            ]}
            onPress={() => handleVote(true)}
            disabled={!canVote}
          >
            <Text style={styles.voteButtonIcon}>👍</Text>
            <Text style={[
              styles.voteButtonText,
              userVote === true && styles.selectedButtonText,
            ]}>
              Believe
            </Text>
            {hasVoted && (
              <Text style={[
                styles.votePercentage,
                userVote === true && styles.selectedButtonText,
              ]}>
                {believePercentage}%
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.voteButton,
              styles.doubtButton,
              userVote === false && styles.selectedDoubtButton,
              !canVote && styles.disabledButton,
            ]}
            onPress={() => handleVote(false)}
            disabled={!canVote}
          >
            <Text style={styles.voteButtonIcon}>👎</Text>
            <Text style={[
              styles.voteButtonText,
              userVote === false && styles.selectedButtonText,
            ]}>
              Doubt
            </Text>
            {hasVoted && (
              <Text style={[
                styles.votePercentage,
                userVote === false && styles.selectedButtonText,
              ]}>
                {doubtPercentage}%
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {hasVoted && (
          <View style={styles.resultsSection}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  styles.believeProgress,
                  { width: `${believePercentage}%` },
                ]}
              />
              <View
                style={[
                  styles.progressBar,
                  styles.doubtProgress,
                  { width: `${doubtPercentage}%` },
                ]}
              />
            </View>
            
            <Text style={styles.totalVotes}>
              {rumor.total_votes} student{rumor.total_votes !== 1 ? 's' : ''} voted
            </Text>
          </View>
        )}

        {hasVoted && (
          <View style={styles.yourVoteSection}>
            <Text style={styles.yourVoteText}>
              You {userVote ? 'believe' : 'doubt'} this rumor
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginTop: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.tea.spicy + '10',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.tea.spicy + '30',
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[3],
  },

  rumorIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing[2],
  },

  rumorTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },

  credibilityBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },

  credibilityEmoji: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing[1],
  },

  credibilityText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  rumorText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing[4],
    fontStyle: 'italic' as const,
  },

  votingSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing[3],
  },

  votingPrompt: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing[3],
  },

  votingButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing[3],
  },

  voteButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing[1],
    borderWidth: 1,
  },

  believeButton: {
    backgroundColor: theme.colors.background.primary,
    borderColor: theme.colors.success,
  },

  doubtButton: {
    backgroundColor: theme.colors.background.primary,
    borderColor: theme.colors.error,
  },

  selectedBelieveButton: {
    backgroundColor: theme.colors.success,
  },

  selectedDoubtButton: {
    backgroundColor: theme.colors.error,
  },

  disabledButton: {
    opacity: 0.7,
  },

  voteButtonIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing[2],
  },

  voteButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },

  selectedButtonText: {
    color: theme.colors.text.inverse,
  },

  votePercentage: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[2],
  },

  resultsSection: {
    marginTop: theme.spacing[2],
  },

  progressContainer: {
    flexDirection: 'row' as const,
    height: 6,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden' as const,
    marginBottom: theme.spacing[2],
  },

  progressBar: {
    height: '100%',
  },

  believeProgress: {
    backgroundColor: theme.colors.success,
  },

  doubtProgress: {
    backgroundColor: theme.colors.error,
  },

  totalVotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },

  yourVoteSection: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },

  yourVoteText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
};