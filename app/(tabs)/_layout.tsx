import { Tabs } from 'expo-router';
import { Chrome as Home, Plus, User } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="discovery"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#6366f1' : 'transparent',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              minWidth: 80,
              alignItems: 'center',
            }}>
              <Home size={size} color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#6366f1' : 'transparent',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              minWidth: 80,
              alignItems: 'center',
            }}>
              <Plus size={size} color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color, focused }) => (
            <View style={{
              backgroundColor: focused ? '#6366f1' : 'transparent',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              minWidth: 80,
              alignItems: 'center',
            }}>
              <User size={size} color={focused ? '#ffffff' : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}