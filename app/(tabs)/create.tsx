import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Calendar, Clock, ChevronDown, Search, MapPin as MapPinIcon } from 'lucide-react-native';
import { ActivityService } from '@/services/activity.service';
import { useAuth } from '@/contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, MapPressEvent, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coffee');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [joinType, setJoinType] = useState('Open (anyone can join)');
  const [joinTypeModalVisible, setJoinTypeModalVisible] = useState(false);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  const categoryOptions = [
    'Coffee',
    'Walk',
    'Run',
    'Workout',
    'Food',
    'Drinks',
    'Study',
    'Other',
  ];

  const joinTypeOptions = [
    'Open (anyone can join)',
    '1 on 1 (you and other)',
    'Limited (set max participants)',
  ];

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDate(date.toLocaleDateString());
      // If date is today and selectedTime is in the past, reset time
      const now = new Date();
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate() &&
        selectedTime &&
        (selectedTime.getHours() < now.getHours() || (selectedTime.getHours() === now.getHours() && selectedTime.getMinutes() < now.getMinutes()))
      ) {
        setSelectedTime(null);
        setTime('');
      }
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      // If selected date is today, only allow future times
      const now = new Date();
      if (
        selectedDate &&
        selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() === now.getMonth() &&
        selectedDate.getDate() === now.getDate()
      ) {
        if (
          time.getHours() < now.getHours() ||
          (time.getHours() === now.getHours() && time.getMinutes() < now.getMinutes())
        ) {
          Alert.alert('Invalid Time', 'Please select a future time for today.');
          return;
        }
      }
      setSelectedTime(time);
      setTime(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleMapPress = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });

    const baseUrl = `https://nominatim.openstreetmap.org`;
    const reverseUrl = `https://us1.locationiq.com/v1/reverse?key=pk.58dc086bd246b672188872db1e596f87&lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const res = await fetch(reverseUrl);
      const data = await res.json();

      let placeName = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      setLocation(placeName);
      setSearchQuery(placeName);
    } catch (error) {
      console.log('Reverse geocode error:', error);
      setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }


    try {
      const res = await fetch(reverseUrl, {
        headers: {
          'User-Agent': 'YourApp/1.0 (your@email.com)',
        },
      });
      const data = await res.json();

      let placeName = '';

      if (data?.name) {
        placeName = data.name;
      } else if (data?.address) {
        const addr = data.address;
        placeName = addr.school || addr.college || addr.university ||
          addr.cafe || addr.restaurant || addr.bar ||
          addr.pub || addr.fast_food || addr.shop ||
          addr.road || addr.neighbourhood || addr.suburb ||
          addr.village || addr.town || addr.city || '';
      }

      // Fallback: If still no good name → do a nearby search
      if (!placeName) {
        const searchUrl = `${baseUrl}/search?format=json&addressdetails=1&limit=1&extratags=1&lat=${latitude}&lon=${longitude}&radius=30`;
        const searchRes = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'YourApp/1.0 (your@email.com)',
          },
        });
        const searchData = await searchRes.json();
        if (searchData.length > 0) {
          placeName = searchData[0].display_name;
        }
      }

      // Final fallback:
      if (!placeName) {
        placeName = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }

      setLocation(placeName);
      setSearchQuery(placeName);

    } catch (error) {
      console.log('Reverse geocode error:', error);
      setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };




  const handleMyLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to use this feature.');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const latitude = loc.coords.latitude;
    const longitude = loc.coords.longitude;

    setRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMarker({ latitude, longitude });

    try {
      // Reverse geocode with LocationIQ
      const reverseUrl = `https://us1.locationiq.com/v1/reverse?key=pk.58dc086bd246b672188872db1e596f87&lat=${latitude}&lon=${longitude}&format=json`;
      const res = await fetch(reverseUrl);
      const data = await res.json();

      let placeName = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      // ✅ update both location (for saving) and searchQuery (for input box)
      setLocation(placeName);
      setSearchQuery(placeName);
    } catch (error) {
      console.log('Reverse geocode error:', error);
      const coordsText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      setLocation(coordsText);
      setSearchQuery(coordsText);
    }
  };


  const handleCreateActivity = async () => {
    if (!title || !description || !date || !time || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an activity');
      return;
    }

    setLoading(true);
    try {
      await ActivityService.createActivity({
        title,
        description,
        category,
        joinType,
        date,
        time,
        location: marker
          ? { name: location, latitude: marker.latitude, longitude: marker.longitude }
          : { name: location, latitude: 40.7128, longitude: -74.0060 },
        createdBy: user.uid,
      });

      Alert.alert('Success', 'Activity created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
      query
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TAGSApp/1.0 (contact: youremail@example.com)',
        },
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.log('Nominatim fetch error:', e);
      setSuggestions([]);
    }
  };


  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Debounce searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSuggestionSelect = (item: any) => {
    setLocation(item.display_name);
    setRegion({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMarker({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    });
    setSuggestions([]);
    setSearchQuery(item.display_name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MapPin size={24} color="#6366f1" />
        <Text style={styles.headerTitle}>Tags</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Create Activity</Text>
        <Text style={styles.subtitle}>Share what you're doing and connect with others</Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Activity Details</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Coffee chat at Central Park"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell people what you're planning to do..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryModalVisible(true)}>
                <Text style={styles.dropdownText} numberOfLines={1} ellipsizeMode="tail">{category}</Text>
                <View style={styles.chevronContainer}>
                  <ChevronDown size={16} color="#6b7280" />
                </View>
              </TouchableOpacity>
              <Modal
                visible={categoryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoryModalVisible(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setCategoryModalVisible(false)}>
                  <View style={styles.modalContent}>
                    {categoryOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.modalOption}
                        onPress={() => {
                          setCategory(option);
                          setCategoryModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Join Type *</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setJoinTypeModalVisible(true)}>
                <Text style={styles.dropdownText} numberOfLines={1} ellipsizeMode="tail">{joinType}</Text>
                <View style={styles.chevronContainer}>
                  <ChevronDown size={16} color="#6b7280" />
                </View>
              </TouchableOpacity>
              <Modal
                visible={joinTypeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setJoinTypeModalVisible(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setJoinTypeModalVisible(false)}>
                  <View style={styles.modalContent}>
                    {joinTypeOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={styles.modalOption}
                        onPress={() => {
                          setJoinType(option);
                          setJoinTypeModalVisible(false);
                        }}
                      >
                        <Text style={styles.modalOptionText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
              {joinType === 'Limited (set max participants)' && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Max participants"
                  placeholderTextColor="#9ca3af"
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                  keyboardType="numeric"
                />
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: date ? '#1f2937' : '#9ca3af' }}>
                  {date ? date : 'Select date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={{ color: time ? '#1f2937' : '#9ca3af' }}>
                  {time ? time : 'Select time'}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPinIcon size={20} color="#6366f1" />
            <Text style={styles.sectionTitle}>Set Location *</Text>
          </View>

          <Text style={styles.locationDescription}>
            Search for a place, click on the map, or use "My Location" button to set the activity location.
          </Text>

          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.locationInput}
              placeholder="Search for a place"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => fetchSuggestions(searchQuery)}>
              <Search size={16} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
              <Text style={styles.myLocationText}>My Location</Text>
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionsDropdown}>
              {suggestions.map((item, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleSuggestionSelect(item)} style={styles.suggestionItem}>
                  <Text numberOfLines={1}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {debouncedQuery && suggestions.length === 0 && (
            <View style={styles.suggestionsDropdown}>
              <Text style={{ padding: 12, color: '#9ca3af' }}>No places found.</Text>
            </View>
          )}

          <View style={styles.mapContainer}>
           <MapView
  style={{ flex: 1 }}
  region={region}
  onPress={handleMapPress}
  showsUserLocation={true}
>
  <UrlTile
    urlTemplate="https://tile.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    maximumZ={19}
  />
  {marker && <Marker coordinate={marker} />}
</MapView>



          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateActivity}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Activity...' : 'Create Activity'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366f1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  dropdown: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    minWidth: 0,
    paddingRight: 4, // add a little right padding for the chevron
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  chevronContainer: {
    width: 28, // slightly wider for padding
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4, // right padding for the chevron
  },
  locationDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  locationInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationButton: {
    backgroundColor: '#ec4899',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  suggestionsDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 180,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 10,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});