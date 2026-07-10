import { Redirect, Tabs } from 'expo-router';
import { House, LogOut, ScanBarcode } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/contexts/auth-context';

const tintColor = '#0a7ea4';
const inactiveColor = '#687076';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E5E7EB',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon as={House} color={color} size="xl" />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Icon as={ScanBarcode} color={color} size="xl" />,
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          href: null,
          title: 'Loan Requests',
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: tintColor,
        }}
      />
      <Tabs.Screen
        name="laptop"
        options={{
          href: null,
          title: 'Total Laptop',
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: tintColor,
        }}
      />
      <Tabs.Screen
        name="av"
        options={{
          href: null,
          title: 'Total AV',
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: tintColor,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          href: null,
          title: 'Total Network',
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: tintColor,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          href: null,
          title: 'Activity History',
          headerShown: true,
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: tintColor,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color }) => <Icon as={LogOut} color={color} size="xl" />,
        }}
      />
    </Tabs>
  );
}
