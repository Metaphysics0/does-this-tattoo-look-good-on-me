import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroNode,
  ViroImage,
  ViroTrackingStateConstants,
} from '@viro-community/react-viro';
import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import {
  initTensorFlow,
  loadBodySegmentationModel,
  imageToTensor,
  getBodySegmentation,
  getSkinTone,
  blendTattooWithSkin,
} from '../../utils/bodySegmentation';

interface ARTattooViewProps {
  tattooUri: string;
  onClose: () => void;
}

// Create an AR Scene Component with any props to satisfy TypeScript
const ARTattooScene = (props: { tattooUri: string }) => {
  const { tattooUri } = props;
  const [modelLoaded, setModelLoaded] = useState(false);
  const [tattooImage, setTattooImage] = useState(tattooUri);
  const [trackingState, setTrackingState] = useState('');
  const [skinTone, setSkinTone] = useState<{
    r: number;
    g: number;
    b: number;
  } | null>(null);
  const modelRef = useRef<bodySegmentation.BodySegmenter | null>(null);
  const processingFrame = useRef(false);

  useEffect(() => {
    const setupTensorFlow = async () => {
      try {
        await initTensorFlow();
        const model = await loadBodySegmentationModel();
        modelRef.current = model;
        setModelLoaded(true);
      } catch (error) {
        console.error('Error setting up TensorFlow:', error);
      }
    };

    setupTensorFlow();

    return () => {
      // Clean up resources
      if (modelRef.current) {
        modelRef.current = null;
      }
    };
  }, []);

  // Process the camera frame for body segmentation
  const onCameraFrame = async (cameraFrame: any) => {
    if (!modelLoaded || !modelRef.current || processingFrame.current) {
      return;
    }

    processingFrame.current = true;

    try {
      const { pixels, width, height } = cameraFrame;

      // Convert camera frame to tensor
      const imageTensor = imageToTensor(pixels, width, height);

      // Get body segmentation
      const segmentation = await getBodySegmentation(
        modelRef.current,
        imageTensor
      );

      // Get skin tone - use type assertion to handle incompatible types
      const extractedSkinTone = getSkinTone(segmentation as any, imageTensor);
      setSkinTone(extractedSkinTone);

      // Blend tattoo with skin tone
      const blendedTattoo = await blendTattooWithSkin(
        tattooUri,
        extractedSkinTone
      );
      setTattooImage(blendedTattoo);

      // Clean up tensors
      tf.dispose(imageTensor);
    } catch (error) {
      console.error('Error processing camera frame:', error);
    } finally {
      processingFrame.current = false;
    }
  };

  const onTrackingUpdated = (state: any, reason: any) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setTrackingState('Normal');
    } else if (state === ViroTrackingStateConstants.TRACKING_LIMITED) {
      setTrackingState(`Limited: ${reason}`);
    } else {
      setTrackingState('None');
    }
  };

  // Using any type to bypass type checking for Viro components
  return React.createElement(ViroARScene as any, {
    onTrackingUpdated: onTrackingUpdated,
    onCameraARFrame: onCameraFrame,
    children: (
      <ViroNode position={[0, -1, -2]} transformBehaviors={['billboardY']}>
        <ViroImage
          source={{ uri: tattooImage }}
          width={1}
          height={1}
          opacity={0.8}
          position={[0, 0, -1]}
        />

        {/* Display tracking and skin tone info for debugging */}
        {skinTone && (
          <ViroNode position={[0, -0.5, 0]}>
            <ViroImage
              source={{
                uri: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTEtMTlUMTA6NTk6NDctMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTExLTE5VDExOjAyOjIyLTA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTExLTE5VDExOjAyOjIyLTA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmVkODliNTE2LTRl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`,
              }}
              width={0.3}
              height={0.3}
              opacity={1}
            />
            {/* Display a rectangular object with the skin tone color */}
            <ViroNode position={[0, 0, 0.01]}>
              <ViroImage
                source={{
                  uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
                }}
                width={0.3}
                height={0.3}
                opacity={1}
              />
            </ViroNode>
          </ViroNode>
        )}
      </ViroNode>
    ),
  });
};

const ARTattooView: React.FC<ARTattooViewProps> = ({ tattooUri, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize TensorFlow.js when component mounts
    const init = async () => {
      try {
        await initTensorFlow();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize TensorFlow:', error);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading TensorFlow models...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          // Using a factory function that returns the scene element to avoid type issues
          scene: () => <ARTattooScene tattooUri={tattooUri} />,
        }}
        style={styles.arView}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close AR Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  arView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'white',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ARTattooView;
