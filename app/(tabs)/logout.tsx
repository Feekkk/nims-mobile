import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/auth-context';

export default function LogoutScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      Alert.alert(
        'Log out',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.replace('/'),
          },
          {
            text: 'Log out',
            style: 'destructive',
            onPress: signOut,
          },
        ],
        { cancelable: false },
      );
    }, [router, signOut]),
  );

  return null;
}
