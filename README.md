# DoesThisTattooLookGoodOnMe?

An AR-powered mobile application that helps users visualize how tattoo designs would look on their body before getting inked.

## Project Overview

DoesThisTattooLookGoodOnMe? is a React Native application that uses augmented reality and AI to intelligently place tattoo designs on a user's body in real-time. The app functions similarly to an Instagram filter, allowing users to see how a specific tattoo design would look on their body from different angles and in different lighting conditions.

## Core Features

- Real-time AR tattoo visualization on body parts
- Smart AI-powered placement of tattoo designs
- Upload custom tattoo designs (PNG format)
- Adjustable sizing, rotation, and positioning
- Save and share visualization results
- Browse catalog of tattoo designs
- User profiles for both tattoo enthusiasts and artists

## Tech Stack

### Frontend

- React Native (cross-platform mobile framework)
- Expo (development platform)
- ViroReact (AR framework for React Native)
- React Navigation (navigation library)

### AR/AI Technologies

- ARKit (iOS) and ARCore (Android) for AR capabilities
- TensorFlow.js for on-device AI models
- Computer vision for body part detection and tracking

### Backend

- Node.js with Express for API server
- MongoDB for database
- Firebase for authentication and real-time features
- AWS S3 for tattoo design storage

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS/Android development environment

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/does-this-tattoo-look-good-on-me.git
   cd does-this-tattoo-look-good-on-me
   ```

2. Install dependencies

   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server

   ```
   npm start
   # or
   yarn start
   ```

4. Run on device or emulator
   - Scan the QR code with the Expo Go app
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## Development Roadmap

1. **MVP (Minimum Viable Product)**

   - Basic camera functionality
   - Simple AR overlay of tattoo designs
   - Limited body part detection
   - Small library of test designs

2. **Enhanced Features**

   - Advanced body mapping
   - Realistic tattoo rendering with skin tone adaptation
   - User accounts and saved designs
   - Social sharing

3. **Pro Features**
   - Artist collaboration platform
   - Custom design upload
   - Advanced editing tools
   - Analytics for tattoo artists

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- ARKit and ARCore for AR capabilities
- TensorFlow.js for AI models
- All open source libraries used in this project
