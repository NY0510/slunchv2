import dayjs from 'dayjs';
import React from 'react';
import {AppRegistry, Text, TextInput} from 'react-native';
import {setCustomImage, setCustomText, setCustomTouchableOpacity} from 'react-native-global-props';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableScreens} from 'react-native-screens';
import {showSplash} from 'react-native-splash-view';

import {name as appName} from './app.json';
import App from '@/App';
import {theme} from '@/styles/theme';
import 'dayjs/locale/ko';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.autoCorrect = false;
TextInput.defaultProps.allowFontScaling = false;

const Root = () => {
  showSplash();
  enableScreens();
  changeNavigationBarColor('transparent', true);
  dayjs.locale('ko');

  setCustomText({
    style: {
      fontFamily: theme.fontWeights.regular,
      color: theme.colors.primaryText,
      includeFontPadding: false,
      fontSize: 16,
    },
  });
  setCustomImage({resizeMode: 'cover'});
  setCustomTouchableOpacity({
    activeOpacity: 0.85,
    hitSlop: {top: 10, bottom: 10, left: 10, right: 10},
  });

  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
};

AppRegistry.registerComponent(appName, () => Root);
