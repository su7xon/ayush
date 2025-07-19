import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

// Screens
import { FeedScreen } from '@/screens/FeedScreen';
import { CreatePostScreen } from '@/screens/CreatePostScreen';
import { TrendingScreen } from '@/screens/TrendingScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { AuthScreen } from '@/screens/AuthScreen';

// Services and Store
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Navigator Component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.border.light,
          borderTopWidth: 1,
          height: theme.layout.tabBar.height,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary[500],
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Trending"
        component={TrendingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                backgroundColor: theme.colors.primary[500],
                borderRadius: size / 2,
                width: size + 8,
                height: size + 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: size - 4, color: theme.colors.text.inverse }}>➕</Text>
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen
        name="Rumor Mill"
        component={() => <Text>Rumor Mill Coming Soon</Text>}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🗣️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Component
export default function App() {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user profile
          try {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*, college(*)')
              .eq('id', session.user.id)
              .single();

            if (profile && !error) {
              setUser(profile);
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        } else {
          setUser(null);
        }

        if (initializing) {
          setInitializing(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializing, setUser]);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>TEA-TIME</Text>
          <Text style={styles.loadingSubtitle}>Loading your campus...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background.primary}
      />
      
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: theme.colors.primary[500],
            background: theme.colors.background.primary,
            card: theme.colors.background.card,
            text: theme.colors.text.primary,
            border: theme.colors.border.light,
            notification: theme.colors.accent[500],
          },
        }}
      >
        {isAuthenticated ? (
          <TabNavigator />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
      
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing[8],
  },
  
  loadingTitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary[500],
    marginBottom: theme.spacing[4],
    textAlign: 'center' as const,
  },
  
  loadingSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
};