import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

export default function CameraControls({
  styles,
  decreaseTattooSize,
  increaseTattooSize,
  deleteTattoo,
}: {
  styles: any;
  decreaseTattooSize: () => void;
  increaseTattooSize: () => void;
  deleteTattoo: () => void;
}) {
  return (
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
  );
}
