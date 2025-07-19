import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Poll } from '@/services/supabase';
import { theme } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';

interface PollComponentProps {
  poll: Poll;
  onVote?: (optionId: string) => void;
}

export const PollComponent: React.FC<PollComponentProps> = ({
  poll,
  onVote,
}) => {
  const [selectedOption, setSelectedOption] = useState(poll.user_vote);
  const [animatedValues] = useState(
    poll.options.map(() => new Animated.Value(0))
  );

  const hasVoted = !!selectedOption;
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const canVote = !hasVoted && !isExpired && onVote;

  const handleVote = (optionId: string, index: number) => {
    if (!canVote) return;

    setSelectedOption(optionId);
    onVote(optionId);

    // Animate the selected option
    Animated.spring(animatedValues[index], {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getPercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const renderOption = (option: any, index: number) => {
    const percentage = getPercentage(option.votes_count, poll.total_votes);
    const isSelected = selectedOption === option.id;
    const isWinning = hasVoted && option.votes_count === Math.max(...poll.options.map(o => o.votes_count));

    const scale = animatedValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.02],
    });

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.option,
          isSelected && styles.selectedOption,
          isWinning && hasVoted && styles.winningOption,
          !canVote && styles.disabledOption,
        ]}
        onPress={() => handleVote(option.id, index)}
        disabled={!canVote}
        activeOpacity={canVote ? 0.7 : 1}
      >
        <Animated.View
          style={[
            styles.optionContent,
            { transform: [{ scale }] },
          ]}
        >
          <View style={styles.optionTextContainer}>
            <Text style={[
              styles.optionText,
              isSelected && styles.selectedOptionText,
            ]}>
              {option.option_text}
            </Text>
            
            {hasVoted && (
              <Text style={[
                styles.percentageText,
                isSelected && styles.selectedPercentageText,
              ]}>
                {percentage}%
              </Text>
            )}
          </View>
          
          {hasVoted && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: isSelected
                      ? theme.colors.primary[600]
                      : isWinning
                      ? theme.colors.accent[500]
                      : theme.colors.secondary[400],
                  },
                ]}
              />
            </View>
          )}
          
          {hasVoted && (
            <Text style={styles.voteCount}>
              {option.votes_count} vote{option.votes_count !== 1 ? 's' : ''}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderPollFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.totalVotes}>
        {poll.total_votes} total vote{poll.total_votes !== 1 ? 's' : ''}
      </Text>
      
      {poll.expires_at && (
        <Text style={[
          styles.expiryText,
          isExpired && styles.expiredText,
        ]}>
          {isExpired
            ? 'Poll ended'
            : `Ends ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`
          }
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pollIcon}>📊</Text>
        <Text style={styles.pollTitle}>Poll</Text>
        {hasVoted && (
          <View style={styles.votedBadge}>
            <Text style={styles.votedBadgeText}>✓ Voted</Text>
          </View>
        )}
      </View>
      
      <View style={styles.optionsContainer}>
        {poll.options
          .sort((a, b) => a.order_index - b.order_index)
          .map((option, index) => renderOption(option, index))}
      </View>
      
      {renderPollFooter()}
    </View>
  );
};

const styles = {
  container: {
    marginTop: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[4],
  },
  
  pollIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing[2],
  },
  
  pollTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  
  votedBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  
  votedBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  optionsContainer: {
    marginBottom: theme.spacing[3],
  },
  
  option: {
    marginBottom: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
    overflow: 'hidden' as const,
  },
  
  selectedOption: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  
  winningOption: {
    borderColor: theme.colors.accent[500],
  },
  
  disabledOption: {
    opacity: 0.8,
  },
  
  optionContent: {
    padding: theme.spacing[3],
    position: 'relative' as const,
  },
  
  optionTextContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    zIndex: 2,
  },
  
  optionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  
  selectedOptionText: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  percentageText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[2],
  },
  
  selectedPercentageText: {
    color: theme.colors.primary[700],
  },
  
  progressBarContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
  },
  
  progressBar: {
    height: '100%',
    borderRadius: theme.borderRadius.md,
    opacity: 0.2,
  },
  
  voteCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[1],
    zIndex: 2,
  },
  
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  
  totalVotes: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  expiryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  
  expiredText: {
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
};