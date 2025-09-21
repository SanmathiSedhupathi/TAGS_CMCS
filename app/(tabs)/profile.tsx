import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, CreditCard as Edit3, Star, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityService } from '@/services/activity.service';
import { Activity } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [userActivities, setUserActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'tags' | 'schedule'>('tags');
  const { user, userProfile, signOut } = useAuth();
  const [joinedActivities, setJoinedActivities] = useState<Activity[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadUserActivities();
      loadJoinedActivities();
    }
  }, [user]);

  const loadUserActivities = async () => {
    if (!user) return;
    
    try {
      const activities = await ActivityService.getUserActivities(user.uid);
      setUserActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };
  const loadJoinedActivities = async () => {
  if (!user) return;

  try {
    const allActivities = await ActivityService.getActivities();
    const joined = allActivities.filter(act => 
      act.participants?.includes(user.uid)
      
    );
    //console.log('Joined Activities:', joinedActivities);

    setJoinedActivities(joined);
  } catch (error) {
    console.error('Error loading joined activities:', error);
  }
};


  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <MapPin size={24} color="#6366f1" />
          <Text style={styles.headerTitle}>Tags</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{userProfile.displayName}</Text>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.rating}>{userProfile.rating.toFixed(1)} rating</Text>
          </View>

          <Text style={styles.bio}>
            {userProfile.bio || 'No bio added yet. Click edit to add one!'}
          </Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tags' && styles.activeTab]}
            onPress={() => setActiveTab('tags')}
          >
            <Text style={[styles.tabText, activeTab === 'tags' && styles.activeTabText]}>
              My Tags ({userActivities.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
            onPress={() => setActiveTab('schedule')}
          >
            <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
              My Schedule ({joinedActivities.length})
            </Text>
          </TouchableOpacity>
        </View>
<View style={styles.activitiesContainer}>
  {activeTab === 'tags' ? (
    userActivities.length === 0 ? (
      <View style={styles.emptyState}>
        <Calendar size={48} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No activities created yet</Text>
        <Text style={styles.emptyStateText}>Start by creating your first activity!</Text>
        <TouchableOpacity 
          style={styles.createActivityButton}
          onPress={() => router.push('/(tabs)/create')}
        >
          <Text style={styles.createActivityButtonText}>Create Activity</Text>
        </TouchableOpacity>
      </View>
    ) : (
      userActivities.map(activity => (
        <View key={activity.id} style={styles.activityCard}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityLocation}>{activity.location.name}</Text>
          <Text style={styles.activityDate}>{activity.date} at {activity.time}</Text>
        </View>
      ))
    )
  ) : (
    joinedActivities.length === 0 ? (
      <View style={styles.emptyState}>
        <Calendar size={48} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No activities joined yet</Text>
        <Text style={styles.emptyStateText}>Explore and join activities to see them here!</Text>
      </View>
    ) : (
      joinedActivities.map(activity => (
        <View key={activity.id} style={styles.activityCard}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
          <Text style={styles.activityLocation}>{activity.location.name}</Text>
          <Text style={styles.activityDate}>{activity.date} at {activity.time}</Text>
        </View>
      ))
    )
  )}
</View>


        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For any questions or support, please reach out to us at{' '}
            <Text style={styles.supportEmail}>support@tagsapp.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
    flex: 1,
    marginLeft: 8,
  },
  signOutText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  editButton: {
    padding: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
  },
  bio: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#1f2937',
  },
  activitiesContainer: {
    paddingHorizontal: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  createActivityButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createActivityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  activityLocation: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  footer: {
    padding: 16,
    marginTop: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  supportEmail: {
    color: '#6366f1',
  },
});