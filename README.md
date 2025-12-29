# Beteseb Chat Application

A real-time chat application built with React Native (Expo) and Supabase, featuring end-to-end encryption.

## Features

- **End-to-End Encryption**: Messages are encrypted using hybrid encryption (RSA-2048-OAEP + AES-256-GCM)
- **Real-time Messaging**: Instant message delivery using Supabase Realtime
- **Cross-Platform**: Works on iOS, Android, and Web
- **Secure Key Storage**: Private keys stored in platform-specific secure storage (Keychain on iOS, EncryptedSharedPreferences on Android)
- **Contact Management**: Add contacts by email
- **User Profiles**: Customizable avatars and bio

## Tech Stack

- **Frontend**: React Native, Expo Router, TypeScript
- **Backend**: Supabase (PostgreSQL, Realtime)
- **Encryption**: Web Crypto API (expo-crypto)
- **Storage**: Expo SecureStore, AsyncStorage
- **Navigation**: Expo Router

## Architecture

### Encryption Flow

**Message Encryption:**
1. Generate random AES-256 key for each message
2. Encrypt message content with AES-GCM
3. Encrypt AES key with recipient's RSA public key
4. Store encrypted message, encrypted key, and IV in database

**Message Decryption:**
1. Retrieve encrypted message from database
2. Decrypt AES key using recipient's RSA private key
3. Decrypt message content using decrypted AES key
4. Display plain text to user

### Database Schema

```sql
users
  - id (uuid)
  - name (text)
  - email (text, unique)
  - avatar (text)
  - bio (text)
  - public_key (text) -- RSA public key in JWK format
  - is_onboarded (boolean)
  - created_at, updated_at

contacts
  - id (uuid)
  - user_id (uuid) -- References users
  - contact_user_id (uuid) -- References users
  - created_at

messages
  - id (uuid)
  - sender_id (uuid)
  - receiver_id (uuid)
  - content (text) -- Encrypted message (Base64)
  - encrypted_key (text) -- Encrypted AES key (Base64)
  - iv (text) -- Initialization vector (Base64)
  - is_read (boolean)
  - created_at, updated_at
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
