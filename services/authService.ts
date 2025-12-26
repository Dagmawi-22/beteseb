import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatService } from "./chatService";
import { EncryptionService } from "./encryptionService";
import { User } from "../types/chat";

const USER_ID_KEY = "@user_id";

export class AuthService {
  static async isLoggedIn(): Promise<boolean> {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId !== null;
  }

  static async getCurrentUserId(): Promise<string | null> {
    return await AsyncStorage.getItem(USER_ID_KEY);
  }

  static async signup(userData: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  }): Promise<User> {
    try {
      const publicKey = await EncryptionService.initializeEncryption();

      const user = await ChatService.createUser({
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        bio: userData.bio,
        isOnboarded: true,
        publicKey,
      });

      await AsyncStorage.setItem(USER_ID_KEY, user.id);

      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(
        "Failed to create user. This email may already be registered."
      );
    }
  }

  static async login(email: string): Promise<User> {
    try {
      const user = await ChatService.getUserByEmail(email);

      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }

      await AsyncStorage.setItem(USER_ID_KEY, user.id);
     const hasKeys = await EncryptionService.hasKeys();
      if (!hasKeys) {
        console.warn('No encryption keys found on this device. Messages cannot be decrypted.');
      }

      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await EncryptionService.clearKeys();
  }


  static async getCurrentUser(): Promise<User | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    return await ChatService.getCurrentUser(userId);
  }
}
