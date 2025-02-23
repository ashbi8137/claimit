import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, Platform, Modal, Keyboard, KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Location Modal Component
const LocationModal = ({ 
  visible, 
  onClose, 
  searchQuery, 
  onSearchChange, 
  onSearch, 
  onCurrentLocation 
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.modalContainer}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => Keyboard.dismiss()}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Location Method</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search location"
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={true}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={onSearch}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.modalButton} 
            onPress={onCurrentLocation}
          >
            <Text style={styles.modalButtonText}>Use Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  </Modal>
);

const LostItemPage = () => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  const categories = ['Electronics', 'Gadgets', 'Clothing', 'Documents', 'Wallet', 'Keys', 'Other'];

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        if (mediaStatus !== 'granted' || cameraStatus !== 'granted' || locationStatus !== 'granted') {
          Alert.alert('Permission Required', 'Enable camera, gallery, and location permissions.');
          return;
        }
      }
    })();
  }, []);

  const handlePhotoUpload = () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: capturePhoto },
        { text: "Choose from Gallery", onPress: pickFromGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const capturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const pickFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleMapPress = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleLocationPress = () => {
    setLocationModalVisible(true);
  };

  const handleSearchLocation = useCallback(async () => {
    try {
      Keyboard.dismiss();
      
      if (!searchQuery.trim()) {
        Alert.alert('Error', 'Please enter a location to search');
        return;
      }

      const searchResults = await Location.geocodeAsync(searchQuery.trim());

      if (searchResults.length > 0) {
        const { latitude, longitude } = searchResults[0];
        const newLocation = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setLocation(newLocation);
        setSelectedLocation(newLocation);
        setLocationModalVisible(false);
        setSearchQuery('');

        if (mapRef.current) {
          mapRef.current.animateToRegion(newLocation, 1000);
        }
      } else {
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search location. Please try again.');
    }
  }, [searchQuery]);

  const handleCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setLocation(newLocation);
      setSelectedLocation(newLocation);
      setLocationModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please check your location settings.');
    }
  };

  const handleSearchChange = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLocationModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  }, []);

  const handleSubmit = () => {
    if (!itemName || !category || !description || !date || !contactDetails || photos.length === 0 || !selectedLocation) {
      Alert.alert('Error', 'Please fill all fields, upload a photo, and select a location.');
      return;
    }
    Alert.alert('Success', 'Lost item posted successfully!');
    setItemName('');
    setCategory('');
    setDescription('');
    setDate('');
    setContactDetails('');
    setPhotos([]);
    setSelectedLocation(null);
    setLocation(null);
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Report a Lost Item</Text>
        <Text style={styles.subtitle}>Help us locate your missing belongings</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
              <Picker.Item label="Select a Category" value="" />
              {categories.map((cat, index) => <Picker.Item key={index} label={cat} value={cat} />)}
            </Picker>
          </View>

          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Item Name" 
            value={itemName} 
            onChangeText={setItemName}
            placeholderTextColor="#666" 
          />

          <TextInput 
            style={[styles.input, styles.multilineInput, styles.elevatedInput]} 
            placeholder="Description" 
            value={description} 
            onChangeText={setDescription} 
            multiline 
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Date & Contact</Text>
          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Date Lost (YYYY-MM-DD)" 
            value={date} 
            onChangeText={setDate}
            placeholderTextColor="#666" 
          />

          <TextInput 
            style={[styles.input, styles.elevatedInput]} 
            placeholder="Contact Details" 
            value={contactDetails} 
            onChangeText={setContactDetails}
            placeholderTextColor="#666" 
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handlePhotoUpload}>
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Photos</Text>
          </TouchableOpacity>

          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removePhoto(index)}>
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
            <Ionicons name="location" size={24} color="#fff" />
            <Text style={styles.locationButtonText}>Select Location</Text>
          </TouchableOpacity>

          {location && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                region={location}
                onPress={handleMapPress}
              >
                {selectedLocation && <Marker coordinate={selectedLocation} title="Selected Location" />}
              </MapView>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>

      <LocationModal 
        visible={locationModalVisible}
        onClose={handleCloseModal}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearchLocation}
        onCurrentLocation={handleCurrentLocation}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
  },
  headerContainer: {
    backgroundColor: '#2c3e50',
    padding: 30,
    paddingTop: 30,
    borderBottomLeftRadius: 30,
    //borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    //borderTopLeftRadius: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    padding: 16,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  pickerContainer: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  input: {
    height: 50,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  uploadButton: {
    backgroundColor: '#4ecdc4',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  map: { 
    width: '100%', 
    height: 200,
    marginVertical: 10,
    borderRadius: 8 
  },
  locationButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '30%',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    top: '30%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  elevatedInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default LostItemPage;
