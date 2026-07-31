import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Onboarding } from '../components/Onboarding';
import type { CatalogChapterId } from '../lib/curriculum';
import { ProgressProvider } from '../lib/progress';
import { LessonScreen } from '../screens/LessonScreen';
import { SubjectScreen } from '../screens/SubjectScreen';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Tabs: undefined;
  Subject: { chapter: CatalogChapterId };
  Lesson: { lessonId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <ProgressProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Subject" component={SubjectScreen} />
          <Stack.Screen name="Lesson" component={LessonScreen} />
        </Stack.Navigator>
        <Onboarding />
      </NavigationContainer>
    </ProgressProvider>
  );
}
