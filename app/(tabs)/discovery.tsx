import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { MapPin, Search } from 'lucide-react-native';
import { ActivityService } from '@/services/activity.service';
import { useAuth } from '@/contexts/AuthContext';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Animatable from 'react-native-animatable';

export default function DiscoveryScreen() {
  const { user } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [region, setRegion] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [joinedActivities, setJoinedActivities] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [sadAnim, setSadAnim] = useState(false);

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const res = await ActivityService.getActivities();
      setActivities(res);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Join activity
 const handleJoinActivity = async (activity: any) => {
  if (!user) {
    Alert.alert('Error', 'You must be logged in to join.');
    return;
  }

  try {
    await ActivityService.joinActivity(activity.id, user.uid);
    setJoinedActivities(prev => [...prev, activity.id]);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  } catch (err: any) {
    Alert.alert('Error', err.message || 'Failed to join activity.');
  }
};


  // Leave activity
  const handleLeaveActivity = async (activity: any) => {
    if (!user) {
    Alert.alert('Error', 'You must be logged in to join.');
    return;
  }
    try {
      await ActivityService.leaveActivity(activity.id, user.uid);
      setJoinedActivities(prev => prev.filter(id => id !== activity.id));
      setSadAnim(true);
      setTimeout(() => setSadAnim(false), 2000);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to leave activity.');
    }
  };

  // Filter activities by search
  const filteredActivities = activities.filter(act =>
    act.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f3' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MapPin size={24} color="#6366f1" />
          <Text style={styles.logoText}>Tags</Text>
        </View>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activity..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={r => setRegion(r)}
      >
        <UrlTile
          urlTemplate="https://tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maximumZ={19}
        />

        {filteredActivities.map((activity) => {
          const lat = activity.location?.latitude;
          const lng = activity.location?.longitude;

          if (lat && lng) {
            return (
              <Marker
                key={activity.id}
                coordinate={{ latitude: lat, longitude: lng }}
                pinColor={joinedActivities.includes(activity.id) ? 'green' : '#f16f63ff'}
                onPress={() => {
                  setSelectedActivity(activity);
                  setModalVisible(true);
                }}
              />
            );
          }
          return null;
        })}
      </MapView>

      {/* Activity Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>


          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {selectedActivity && (
                <>
                  <Text style={styles.activityTitle}>{selectedActivity.title}</Text>
                  <Text style={styles.activityCategory}>{selectedActivity.category}</Text>
                  <Text style={styles.activityLocation}>
                    📍 {selectedActivity.location?.name
                      ? selectedActivity.location.namw
                      : `Lat: ${selectedActivity.location?.latitude?.toFixed(4)}, Lng: ${selectedActivity.location?.longitude?.toFixed(4)}`}
                  </Text>

                  <Text style={styles.activityDate}>
                    📅 {selectedActivity.date || 'Date not specified'}
                  </Text>
                  <Text style={styles.activityTime}>
                    ⏰ {selectedActivity.time || 'Time not specified'}
                  </Text>
                  <Text style={styles.activityDesc}>{selectedActivity.description}</Text>

                  {joinedActivities.includes(selectedActivity.id) ? (
                    <TouchableOpacity
                      style={[styles.joinButton, styles.leaveButton]}
                      onPress={() => handleLeaveActivity(selectedActivity)}
                    >
                      <Text style={styles.joinButtonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => handleJoinActivity(selectedActivity)}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity>
                  )}


                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Confetti */}
      {confettiActive && <ConfettiCannon count={50} origin={{ x: -10, y: 0 }} fadeOut />}

      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f0f0f3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    shadowColor: '#fff',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#f0f0f3',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000ff',
  },

  scrollContent: {
    paddingBottom: 20,
  },
  activityTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    color: '#333',
  },
  activityCategory: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 10,
  },
  activityLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  activityDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#555',
  },
  activityDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  joinButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#fff',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 5,
  },
  leaveButton: {
    backgroundColor: '#f16f63',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  sadEmoji: {
    fontSize: 50,
    position: 'absolute',
    bottom: 50,
    width: '100%',
    textAlign: 'center',
  },
});
