import * as tf from '@tensorflow/tfjs';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';

// Initialize TensorFlow.js
export const initTensorFlow = async () => {
  await tf.ready();
  console.log('TensorFlow.js initialized');
};

// Load the body segmentation model
export const loadBodySegmentationModel = async () => {
  // Load the model - SelfieSegmentation is lightweight and works well on mobile
  const model = await bodySegmentation.createSegmenter(
    bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
    {
      runtime: 'mediapipe',
      solutionPath:
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
    }
  );

  return model;
};

// Process the image and get segmentation mask
export const getBodySegmentation = async (
  model: bodySegmentation.BodySegmenter,
  imageTensor: tf.Tensor3D
) => {
  const segmentation = await model.segmentPeople(imageTensor);
  return segmentation;
};

// Convert camera frame to tensor
export const imageToTensor = (
  imageData: Uint8Array,
  width: number,
  height: number
): tf.Tensor3D => {
  return tf.tidy(() => {
    const tensor = tf.browser
      .fromPixels({ data: imageData, width, height })
      .toFloat();
    return tensor;
  });
};

// Define a type for the segmentation result
type SegmentationResult = Array<{
  mask: tf.Tensor2D;
  maskValueToLabel: (value: number) => { r: number; g: number; b: number };
}>;

// Gets the dominant skin tone from a segmentation mask
export const getSkinTone = (
  segmentation: SegmentationResult,
  imageTensor: tf.Tensor3D
) => {
  // Check if there's at least one person detected
  if (segmentation.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const skinMask = segmentation[0].mask;

  // Apply mask to original image to get only skin pixels
  const maskedImage = tf.mul(imageTensor, skinMask.expandDims(2));

  // Calculate average color values for skin
  const skinPixelsR = maskedImage.slice([0, 0, 0], [-1, -1, 1]).mean();
  const skinPixelsG = maskedImage.slice([0, 0, 1], [-1, -1, 1]).mean();
  const skinPixelsB = maskedImage.slice([0, 0, 2], [-1, -1, 1]).mean();

  // Convert to RGB values
  const r = skinPixelsR.dataSync()[0];
  const g = skinPixelsG.dataSync()[0];
  const b = skinPixelsB.dataSync()[0];

  // Clean up tensors
  skinPixelsR.dispose();
  skinPixelsG.dispose();
  skinPixelsB.dispose();
  maskedImage.dispose();

  return { r, g, b };
};

// Blend tattoo with skin tone for more realistic appearance
export const blendTattooWithSkin = async (
  tattooUri: string,
  skinTone: { r: number; g: number; b: number },
  opacity: number = 0.85
) => {
  // This is a placeholder for image blending logic
  // In a real implementation, you would use an image processing library
  // to blend the tattoo with the skin tone for a realistic effect

  console.log('Blending tattoo with skin tone:', skinTone);

  // For now, just return the original tattoo URI
  return tattooUri;
};
