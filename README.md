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

3. Create a Supabase project at https://supabase.com

4. Run the SQL schema:
   - Open Supabase SQL Editor
   - Execute the contents of `supabase-schema.sql`

5. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase URL and anon key:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your-project-url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

6. Enable Realtime for the messages table:
   - Go to Database > Replication in Supabase dashboard
   - Enable replication for the `messages` table

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── chat/[id].tsx      # Chat conversation screen
│   ├── onboarding.tsx     # Signup/Login screen
│   └── _layout.tsx        # Root layout with navigation
├── components/            # Reusable UI components
├── constants/             # App constants (colors, etc.)
├── context/              # React Context providers
│   └── ChatContext.tsx   # Global chat state management
├── services/             # Business logic layer
│   ├── authService.ts    # Authentication
│   ├── chatService.ts    # Chat operations & Supabase queries
│   └── encryptionService.ts  # E2E encryption
├── types/                # TypeScript type definitions
│   ├── chat.ts           # Chat-related types
│   └── database.ts       # Supabase database types
└── lib/
    └── supabase.ts       # Supabase client configuration
```

## Security Considerations

### What's Protected
- Message content is encrypted end-to-end
- Private keys never leave the device
- Each message uses a unique AES key
- AES-GCM provides authenticated encryption

### What's Not Protected
- Metadata (who is messaging whom, timestamps)
- Contact lists
- User profiles (names, avatars)
- Online/offline status

### Limitations
- No perfect forward secrecy (compromise of private key exposes all messages)
- No message signing (sender identity not cryptographically verified)
- No cross-device key sync (logging in on new device loses access to old messages)
- Web platform has limited SecureStore support

## Authentication

This implementation uses a simplified authentication system (email-only, no password) to focus on demonstrating the encryption and real-time messaging features. For production use, implement proper authentication using Supabase Auth or similar.

## Testing

1. Create two test accounts with different emails
2. Add each other as contacts using email addresses
3. Send messages between accounts
4. Verify messages are encrypted in the Supabase database:
   ```sql
   SELECT content, encrypted_key, iv FROM messages LIMIT 1;
   ```
   You should see Base64-encoded encrypted data, not plain text.

## Documentation

- `E2E_ENCRYPTION.md` - Detailed encryption implementation guide
- `SUPABASE_SETUP.md` - Step-by-step Supabase setup instructions
- `supabase-schema.sql` - Complete database schema with RLS policies

## License

This is a portfolio/educational project. Use at your own discretion.

## Notes

This project is designed to demonstrate:
- Real-time messaging architecture
- End-to-end encryption implementation
- Supabase integration
- React Native best practices
- TypeScript usage

