import dayjs from 'dayjs';
import React, {useEffect, useRef} from 'react';
import {Alert, AppState, BackHandler, Linking, Platform, StatusBar, ToastAndroid} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {hideSplash} from 'react-native-splash-view';
import Toast from 'react-native-toast-message';
import VersionCheck from 'react-native-version-check';

import {typography} from './theme';
import {AuthProvider} from '@/contexts/AuthContext';
import {useTheme} from '@/contexts/ThemeContext';
import {UserProvider} from '@/contexts/UserContext';
import {sendNotification} from '@/lib/notification';
import {getToastConfig} from '@/lib/toast';
import Stack from '@/navigation/RootStacks';
import messaging from '@react-native-firebase/messaging';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://6a5152bf71c0a9190c0375c506b21dd1@o4509012689879040.ingest.us.sentry.io/4509012691451904',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  tracesSampleRate: 0.1,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
  ],
});

const showMaintenanceAlert = () => {
  const now = dayjs();
  if (now.hour() === 0 && now.minute() < 10) {
    Alert.alert('서버 점검 중', '매일 00:00 ~ 00:10은 서버 점검 시간입니다. 일부 기능이 제한될 수 있어요.', [{text: '확인'}], {cancelable: true});
  }
};

const App = () => {
  const {theme, isDark} = useTheme();
  const backPressedOnceRef = useRef(false);

  useEffect(() => {
    setTimeout(hideSplash, 250);
    checkForUpdate();
    showMaintenanceAlert();
  }, []);

  const checkForUpdate = async () => {
    try {
      const res = await VersionCheck.needUpdate({depth: 2});
      if (res.isNeeded && res.storeUrl) {
        Alert.alert(
          '새로운 버전이 출시되었습니다',
          '앱을 업데이트 해주세요',
          [
            {text: '업데이트', onPress: () => Linking.openURL(res.storeUrl)},
            {text: '취소', style: 'cancel'},
          ],
          {cancelable: true},
        );
        backPressedOnceRef.current = false;
      }
    } catch (e) {
      console.error(`Update check failed: ${(e as Error).message}`);
    }
  };

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkForUpdate();
        showMaintenanceAlert();
      }
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const {title, body} = remoteMessage.notification ?? {};
      await sendNotification(title, body);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backAction = () => {
        if (backPressedOnceRef.current) {
          BackHandler.exitApp();
          return true;
        }
        backPressedOnceRef.current = true;
        ToastAndroid.show('뒤로가기를 한 번 더 누르면 종료돼요.', ToastAndroid.SHORT);
        setTimeout(() => (backPressedOnceRef.current = false), 2000);
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={{flex: 1, backgroundColor: theme.background}}>
        <UserProvider>
          <AuthProvider>
            <StatusBar animated barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
            <Stack />
          </AuthProvider>
        </UserProvider>
      </SafeAreaView>
      <Toast config={getToastConfig(theme, typography)} />
    </GestureHandlerRootView>
  );
};

export default Sentry.wrap(App);
