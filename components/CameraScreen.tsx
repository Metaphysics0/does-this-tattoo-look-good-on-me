import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  Platform,
} from 'react-native';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function CameraScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      // On web/desktop we don't need to explicitly request camera permissions
      if (Platform.OS === 'web') {
        setHasCameraPermission(true);
      } else {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      }
    })();
  }, []);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // On web, we need a more direct approach for file selection
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        // @ts-ignore
        const file = event.target.files[0];
        if (file) {
          const fileReader = new FileReader();
          fileReader.onload = (e) => {
            // @ts-ignore
            setSelectedImage(e.target.result);
          };
          fileReader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (result.granted) {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

        if (!pickerResult.canceled) {
          setSelectedImage(pickerResult.assets[0].uri);
        }
      }
    }
  };

  const toggleCamera = () => {
    setCameraFacing((prevFacing) =>
      prevFacing === 'front' ? 'back' : 'front'
    );
  };

  if (hasCameraPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text>
          No access to camera. Please enable camera access in your browser or
          device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
        {selectedImage && (
          <ImageBackground
            source={{ uri: selectedImage }}
            style={styles.tattooOverlay}
            resizeMode="contain"
          />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <MaterialIcons name="add-photo-alternate" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCamera}>
            <MaterialIcons name="flip-camera-ios" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    gap: 30,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  tattooOverlay: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    alignSelf: 'center',
    top: '25%',
    opacity: 0.8,
  },
});
