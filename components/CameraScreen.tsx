import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
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
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const cameraRef = useRef<any>(null);
  const pan = useRef(new Animated.ValueXY()).current;

  // Configure pan responder for dragging the tattoo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Store current position as offset
        const currentX = Number(JSON.stringify(pan.x));
        const currentY = Number(JSON.stringify(pan.y));

        pan.setOffset({
          x: currentX,
          y: currentY,
        });
        pan.setValue({ x: 0, y: 0 });
        // When user touches the image, mark it as selected
        setIsImageSelected(true);
      },
      onPanResponderMove: (
        e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        // Handle pinch to zoom if there are two touches
        if (e.nativeEvent.touches.length >= 2) {
          const touch1 = e.nativeEvent.touches[0];
          const touch2 = e.nativeEvent.touches[1];

          // Calculate distance between touches
          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (lastDistance > 0) {
            // Calculate scale factor
            const scaleFactor = distance / lastDistance;
            const newScale = Math.max(
              0.5,
              Math.min(3, imageScale * scaleFactor)
            );
            setImageScale(newScale);
          }

          setLastDistance(distance);

          // Don't move image when pinching
          return;
        }

        // If single touch, handle dragging
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, gestureState);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Update the position state - extract current values
        const currentX = Number(JSON.stringify(pan.x));
        const currentY = Number(JSON.stringify(pan.y));
        setImagePosition({ x: currentX, y: currentY });
        setLastDistance(0);
      },
    })
  ).current;

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

  // Handle background tap to deselect image
  const handleBackgroundPress = () => {
    if (isImageSelected) {
      setIsImageSelected(false);
    }
  };

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
            // Reset position and scale when new image is selected
            pan.setValue({ x: 0, y: 0 });
            setImagePosition({ x: 0, y: 0 });
            setImageScale(1);
            setIsImageSelected(true);
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
          // Reset position and scale when new image is selected
          pan.setValue({ x: 0, y: 0 });
          setImagePosition({ x: 0, y: 0 });
          setImageScale(1);
          setIsImageSelected(true);
        }
      }
    }
  };

  const toggleCamera = () => {
    setCameraFacing((prevFacing) =>
      prevFacing === 'front' ? 'back' : 'front'
    );
  };

  const resetTattoo = () => {
    // Reset position and scale
    pan.setValue({ x: 0, y: 0 });
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  const increaseTattooSize = () => {
    const newScale = Math.min(3, imageScale + 0.1);
    setImageScale(newScale);
  };

  const decreaseTattooSize = () => {
    const newScale = Math.max(0.5, imageScale - 0.1);
    setImageScale(newScale);
  };

  const deleteTattoo = () => {
    setSelectedImage(null);
    setIsImageSelected(false);
    pan.setValue({ x: 0, y: 0 });
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
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
      <TouchableOpacity
        style={styles.fullScreenTouchable}
        activeOpacity={1}
        onPress={handleBackgroundPress}
      >
        <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
          {selectedImage && (
            <>
              <Animated.View
                style={[
                  styles.tattooContainer,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: imageScale },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.tattooImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {isImageSelected && (
                <View style={styles.imageControlsContainer}>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={decreaseTattooSize}
                    >
                      <MaterialIcons name="remove" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.controlButton}
                      onPress={increaseTattooSize}
                    >
                      <MaterialIcons name="add" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.controlButton, styles.deleteButton]}
                      onPress={deleteTattoo}
                    >
                      <MaterialIcons name="delete" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialIcons
                name="add-photo-alternate"
                size={32}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleCamera}>
              <MaterialIcons name="flip-camera-ios" size={32} color="white" />
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity style={styles.button} onPress={resetTattoo}>
                <MaterialIcons name="refresh" size={32} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      </TouchableOpacity>
      {selectedImage && !isImageSelected && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>• Tap tattoo to edit</Text>
          <Text style={styles.instructionText}>• Drag to move the tattoo</Text>
          <Text style={styles.instructionText}>
            • Pinch to resize the tattoo
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreenTouchable: {
    flex: 1,
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
  tattooContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
  },
  tattooImage: {
    width: 200,
    height: 200,
    opacity: 0.8,
  },
  instructions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    margin: 20,
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
  imageControlsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 10,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: 'rgba(180, 0, 0, 0.8)',
    marginLeft: 15,
  },
});
