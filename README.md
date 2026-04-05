# Human Counter AI - Native Mobile Application

A premium, high-performance mobile application built with **React Native (Expo)** and **TensorFlow.js**. This tool uses on-device AI to detect and categorize people (Men, Women, Children) in real-time.

## 🚀 Features
- **Real-time Detection**: Edge-computing utilizing `tfjs-react-native`.
- **Gesture-Based Verification**: Tinder-style Swipe Stack for manual categorization.
- **Professional Reporting**: Export stats as high-quality PNG or PDF.
- **Emoji-Free Design**: Clean, grown-up UI using Lucide iconography.
- **Glassmorphism**: Premium "glass" aesthetics with native blur effects.

## 🛠️ Technology Stack
- **Framework**: React Native (via Expo)
- **AI Engine**: TensorFlow.js (COCO-SSD Lite)
- **Styling**: Native Reanimated & Gesture Handler
- **Backend**: Supabase (PostgreSQL)
- **Exporting**: `react-native-view-shot` & `expo-print`

## 🏁 Getting Started
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Run the App**:
   ```bash
   npx expo start
   ```

## 📄 Documentation
See the [docs/](docs/) directory for detailed guides:
- [Getting Started](docs/getting-started.md)
- [Supabase Setup & SQL](docs/supabase-setup.md)
