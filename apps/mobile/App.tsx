import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Gamepad2, Gift, Home, Medal, Settings, Trophy, User, Users } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RewardsScreen } from './src/screens/RewardsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { TournamentScreen } from './src/screens/TournamentScreen';
import { initializeAds } from './src/ads/adMob';
import { trackEvent, trackScreenView } from './src/services/analytics';
import { useAuthStore } from './src/store/authStore';
import { useScoreStore } from './src/store/scoreStore';

export type RootTabParamList = {
  Home: undefined;
  Game: undefined;
  Lobby: undefined;
  Cup: undefined;
  Rewards: undefined;
  Ranks: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const icons = {
  Home,
  Game: Gamepad2,
  Lobby: Users,
  Cup: Trophy,
  Rewards: Gift,
  Ranks: Medal,
  Profile: User,
  Settings,
};

export default function App() {
  const startAuth = useAuthStore((state) => state.start);
  const user = useAuthStore((state) => state.user);
  const startScores = useScoreStore((state) => state.start);
  const syncLocalName = useScoreStore((state) => state.syncLocalName);

  useEffect(() => startAuth(), [startAuth]);

  useEffect(() => {
    if (!user) return;
    startScores();
    syncLocalName();
  }, [startScores, syncLocalName, user]);

  useEffect(() => {
    void initializeAds();
    trackEvent('app_open', { platform: 'mobile' });
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={(state) => trackScreenView(state?.routes[state.index]?.name ?? 'Unknown')}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: 'rgba(8, 10, 18, 0.96)',
              borderTopColor: 'rgba(255,255,255,0.1)',
              height: 76,
              paddingTop: 8,
              paddingBottom: 12,
            },
            tabBarActiveTintColor: theme.colors.aqua,
            tabBarInactiveTintColor: 'rgba(255,255,255,0.48)',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
            tabBarIcon: ({ color, size }) => {
              const Icon = icons[route.name];
              return <Icon color={color} size={size} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Game" component={GameScreen} />
          <Tab.Screen name="Lobby" component={LobbyScreen} />
          <Tab.Screen name="Cup" component={TournamentScreen} />
          <Tab.Screen name="Rewards" component={RewardsScreen} />
          <Tab.Screen name="Ranks" component={LeaderboardScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
