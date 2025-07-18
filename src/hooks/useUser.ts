import {useCallback, useEffect, useState} from 'react';

import {UserClassInfo, UserSchoolInfo} from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUser = () => {
  const [schoolInfo, setSchoolInfo] = useState<UserSchoolInfo>({} as UserSchoolInfo);
  const [classInfo, setClassInfo] = useState<UserClassInfo>({} as UserClassInfo);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadUserData = useCallback(async () => {
    try {
      const classData = await AsyncStorage.getItem('class');
      const schoolData = await AsyncStorage.getItem('school');

      const parsedClassInfo = classData ? JSON.parse(classData) : {};
      const parsedSchoolInfo = schoolData ? JSON.parse(schoolData) : {};

      setClassInfo(parsedClassInfo);
      setSchoolInfo(parsedSchoolInfo);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData, refreshKey]);

  const refreshUserData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {schoolInfo, classInfo, refreshUserData};
};
