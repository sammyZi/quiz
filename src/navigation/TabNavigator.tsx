import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet, Text, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonsScreen } from '../screens/LessonsScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { theme } from '../theme/theme';

export type TabParamList = {
  Home: undefined;
  Lessons: undefined;
  Progress: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function TabGlyph({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  const glyph = name === 'Home' ? '⌂' : name === 'Lessons' ? '☰' : '◉';
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapFocused]}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>{glyph}</Text>
    </View>
  );
}

/** Almost no press fade — default tab press opacity feels like the whole bar blinks. */
function SoftTabButton(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      pressOpacity={1}
      pressColor="transparent"
      android_ripple={{ color: 'transparent', borderless: false, radius: 0 }}
      style={[props.style, styles.button]}
    />
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: theme.light.ink,
        tabBarInactiveTintColor: theme.light.muted,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarItemStyle: styles.item,
        tabBarButton: SoftTabButton,
        tabBarIcon: ({ focused }) => <TabGlyph name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={LessonsScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.light.surface,
    borderTopWidth: 0,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    height: 78,
    paddingTop: 8,
    paddingBottom: 10,
    ...theme.clay.soft,
  },
  item: {
    paddingTop: 2,
  },
  button: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: theme.font.display,
    fontSize: 12,
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.light.tint.cream,
  },
  iconWrapFocused: {
    backgroundColor: theme.light.tint.lilac,
  },
  icon: {
    fontSize: 18,
    color: theme.light.ink,
    lineHeight: 22,
    opacity: 0.55,
  },
  iconFocused: {
    opacity: 1,
  },
});
