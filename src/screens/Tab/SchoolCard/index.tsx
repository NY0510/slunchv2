import React, {useEffect, useState} from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {interpolate, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

import Barcode from './components/Barcode';
import Container from '@/components/Container';
import {showToast} from '@/lib/toast';
import {useAuth} from '@/providers/AuthProvider';
import {theme} from '@/styles/theme';
import DeviceBrightness from '@adrianso/react-native-device-brightness';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {useIsFocused} from '@react-navigation/native';
import {useKeepAwake} from '@sayem314/react-native-keep-awake';

const SchoolCard = () => {
  const {user, login, logout, loading} = useAuth();
  const isFocused = useIsFocused();

  const [name, setName] = useState<string>('');
  const [grade, setGrade] = useState<string>('');
  const [classNum, setClassNum] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [generation, setGeneration] = useState<number>(0);
  const [barcodeValue, setBarcodeValue] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [isSunrinEmail, setIsSunrinEmail] = useState(false);
  useKeepAwake();

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    analytics().logScreenView({screen_name: '학생증 페이지', screen_class: 'SchoolCard'});
  }, []);

  useEffect(() => {
    (async () => {
      const demoMode = JSON.parse((await AsyncStorage.getItem('demoMode')) || 'false');
      setIsDemoUser(demoMode);

      if (user && user.user) {
        setIsSunrinEmail(user.user.email.endsWith('@sunrint.hs.kr'));
      } else {
        setIsSunrinEmail(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (isDemoUser) {
      setName('Demo User');
      setGrade('1');
      setClassNum('1');
      setNumber('1');
      setGeneration(0);
      setBarcodeValue('DEMO123456');
      return;
    }

    if (user && user.user) {
      const userEmail = user.user.email || '';
      const userName = user.user.name || '';

      const _name = userName.slice(5);
      const _grade = userName.slice(0, 1);
      const _classNum = parseInt(userName.slice(1, 3), 10).toString();
      const _number = parseInt(userName.slice(3, 5), 10).toString();
      const _generation = 118 - (23 - parseInt(userEmail.slice(0, 2), 10));
      let _barcodeValue = '';

      const year = parseInt(userEmail.slice(0, 2), 10);

      if (year <= 24) {
        _barcodeValue = `S2${user.user.email.slice(0, 2)}0${user.user.email.slice(8, 11)}`;
      } else {
        _barcodeValue = `S2${userEmail.slice(0, 2)}0${userEmail.slice(3, 6)}`;
      }

      setName(_name);
      setGrade(_grade);
      setClassNum(_classNum);
      setNumber(_number);
      setGeneration(_generation);
      setBarcodeValue(_barcodeValue);
    }
  }, [user, isDemoUser]);

  const handleBarcodePress = async () => {
    const currentBrightness = await DeviceBrightness.getBrightnessLevel();
    setOriginalBrightness(currentBrightness);
    await DeviceBrightness.setBrightnessLevel(1);
    setIsModalVisible(true);
  };

  const handleCloseModal = async () => {
    if (originalBrightness !== null) {
      await DeviceBrightness.setBrightnessLevel(originalBrightness);
    }
    setIsModalVisible(false);
  };

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      rotateX.value = interpolate(event.translationY, [-80, 80], [-10, 10]);
      rotateY.value = interpolate(event.translationX, [-80, 80], [10, -10]);
    })
    .onEnd(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{perspective: 1000}, {rotateX: `${rotateX.value}deg`}, {rotateY: `${rotateY.value}deg`}],
    borderWidth: 1,
    borderColor: theme.colors.border,
  }));

  if (loading || !isFocused) {
    return null;
  }

  return (
    <Container style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      {isDemoUser || (user && user.user && isSunrinEmail) ? (
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              animatedStyle,
              {
                justifyContent: 'space-between',
                aspectRatio: 3 / 3.7,
                backgroundColor: theme.colors.card,
                width: '85%',
                borderRadius: 12,
                padding: 16,
                paddingTop: 26,
                paddingBottom: 0,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 6,
              },
            ]}>
            <View>
              <Text style={[theme.typography.caption]}>선린인터넷고등학교 모바일 학생증</Text>
            </View>
            <View style={{gap: 8}}>
              <View style={{flexDirection: 'row', gap: 4, alignItems: 'flex-end'}}>
                <Text style={[theme.typography.title, {fontSize: 32, fontFamily: theme.fontWeights.bold}]}>{name}</Text>
                <Text style={[theme.typography.caption, {color: theme.colors.secondaryText}]}>{`${generation}기`}</Text>
              </View>
              <View>
                <Text style={[theme.typography.subtitle, {color: theme.colors.secondaryText}]}>{`${grade}학년 ${classNum}반 ${number}번`}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleBarcodePress}>
              <View style={{justifyContent: 'center', alignContent: 'center', backgroundColor: theme.colors.border, height: 100, marginHorizontal: -16, borderBottomRightRadius: 12, borderBottomLeftRadius: 12, marginTop: 16, gap: 4}}>
                <Barcode value={barcodeValue} format={'CODE128'} />
                <Text style={[theme.typography.caption, {textAlign: 'center', color: theme.colors.secondaryText}]}>{barcodeValue}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      ) : (
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <TouchableOpacity
            style={{backgroundColor: theme.colors.border, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12}}
            onPress={() => {
              logout();
              login()
                .then(async _user => {
                  const email = _user?.user?.email ?? '';
                  const isSunrin = email.endsWith('@sunrint.hs.kr');

                  if (!isSunrin) {
                    showToast('선린인터넷고등학교 구글 계정으로 로그인해 주세요.');
                    logout().catch(error => showToast(`로그아웃에 실패했어요:\n${error.message}`));
                  } else {
                    showToast('로그인 완료');
                  }
                })
                .catch(error => showToast(`로그인에 실패했어요:\n${error.message}`));
            }}>
            <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
              <FontAwesome6 name="google" iconStyle="brand" size={22} color={theme.colors.primaryText} />
              <Text style={[theme.typography.subtitle, {color: theme.colors.primaryText}]}>로그인</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      <View style={{elevation: 0, zIndex: 0}}>
        <Modal visible={isModalVisible} transparent={true}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              transform: [{rotate: '90deg'}, {scale: 2.5}],
            }}
            onPress={handleCloseModal}
            activeOpacity={1}>
            <Barcode value={barcodeValue} format={'CODE128'} fill={theme.colors.white} />
          </TouchableOpacity>
        </Modal>
      </View>
    </Container>
  );
};

export default SchoolCard;
