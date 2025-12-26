import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatService } from "./chatService";
import { EncryptionService } from "./encryptionService";
import { User } from "../types/chat";

const USER_ID_KEY = "@user_id";

export class AuthService {
  /**
   * Check if user is logged in
   */
  static async isLoggedIn(): Promise<boolean> {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    return userId !== null;
  }

  /**
   * Get current user ID from storage
   */
  static async getCurrentUserId(): Promise<string | null> {
    return await AsyncStorage.getItem(USER_ID_KEY);
  }

  /**
   * Create a new user (simplified auth - no password)
   */
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

  /**
   * Login (simplified - finds user by email)
   */
  static async login(email: string): Promise<User | null> {
    try {
      throw new Error("Login not yet implemented - please sign up");
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(USER_ID_KEY);
    await EncryptionService.clearKeys();
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    return await ChatService.getCurrentUser(userId);
  }
}
