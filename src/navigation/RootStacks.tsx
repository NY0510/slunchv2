import React from 'react';
import {Platform} from 'react-native';

import Loading from '@/components/Loading';
import {useTheme} from '@/contexts/ThemeContext';
import {useFirstOpen} from '@/hooks/useFirstOpen';
import BottomTabs from '@/navigation/BottomTabs';
import Meal from '@/screens/Meal';
import Share from '@/screens/Meal/screens/Share';
import {ClassSelectScreen, IntroScreen, SchoolSearchScreen} from '@/screens/Onboarding';
import Schedules from '@/screens/Schedules';
import DeveloperInfo from '@/screens/Tab/Settings/screens/DeveloperInfo';
import Notification from '@/screens/Tab/Settings/screens/Notification';
import {School} from '@/types/api';
import {createStaticNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

export type RootStackParamList = {
  Tab: undefined;
  Intro: undefined;
  SchoolSearch: {isFirstOpen?: boolean};
  ClassSelect: {school: School; isFirstOpen?: boolean};
  Notifications: undefined;
  Schedules: undefined;
  Meal: undefined;
  DeveloperInfo: undefined;
  Notification: undefined;
  Share: {data: {meal: string; date: string; school: string}};
};

const RootStacks = () => {
  const {theme, typography} = useTheme();
  const {isFirstOpen} = useFirstOpen();

  if (isFirstOpen === null) {
    return <Loading fullScreen />;
  }

  const RootStack = createStackNavigator({
    initialRouteName: isFirstOpen ? 'Intro' : 'Tab',
    screenOptions: {
      headerShown: false,
      animation: Platform.OS === 'ios' ? 'slide_from_right' : 'scale_from_center', // ios: slide_from_right, android: scale_from_center
      freezeOnBlur: true,
      cardStyle: {backgroundColor: theme.background},
      headerStatusBarHeight: 0,
      headerStyle: {
        backgroundColor: theme.background,
        shadowColor: 'transparent',
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
      },
      headerTintColor: theme.primaryText,
      headerTitleAlign: 'left',
      headerTitleStyle: [typography.baseTextStyle, {color: theme.primaryText, fontWeight: '500', fontSize: 18}],
      headerLeftContainerStyle: {paddingLeft: 4},
      headerBackButtonDisplayMode: 'minimal',
      headerBackAccessibilityLabel: '뒤로가기',
    },
    screens: {
      Intro: IntroScreen,
      SchoolSearch: SchoolSearchScreen,
      ClassSelect: ClassSelectScreen,
      Tab: BottomTabs,
      Schedules: {
        screen: Schedules,
        options: {
          headerShown: true,
          title: '학사일정',
        },
      },
      Meal: {
        screen: Meal,
        options: {
          headerShown: true,
          title: '급식',
        },
      },
      DeveloperInfo: {
        screen: DeveloperInfo,
        options: {
          headerShown: true,
          title: '개발자 정보',
        },
      },
      Notification: {
        screen: Notification,
        options: {
          headerShown: true,
          title: '알림 설정',
        },
      },
      Share: {
        screen: Share,
        options: {
          headerShown: true,
          title: '공유',
        },
      },
    },
  });
  const Stack = createStaticNavigation(RootStack);

  return <Stack />;
};

export default RootStacks;
