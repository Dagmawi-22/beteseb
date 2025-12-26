import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { setCurrentUserId } from '../context/ChatContext';
import { AuthService } from '../services/authService';
import { mockAvatarOptions } from '../mock/data';
import { AppColors } from '../constants/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('Hey there! I am using Beteseb Chat App');
  const [selectedAvatar, setSelectedAvatar] = useState(mockAvatarOptions[0]);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name || !email) {
      alert('Please fill in your name and email');
      return;
    }

    setLoading(true);
    try {
      // Create user in Supabase
      const user = await AuthService.signup({
        name,
        email,
        bio,
        avatar: selectedAvatar,
      });

      // Set the current user ID for ChatContext
      setCurrentUserId(user.id);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      alert(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Chat App!</Text>
        <Text style={styles.subtitle}>Let's set up your profile</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Choose Your Avatar</Text>
          <View style={styles.avatarGrid}>
            {mockAvatarOptions.map((avatarUrl) => (
              <TouchableOpacity
                key={avatarUrl}
                onPress={() => setSelectedAvatar(avatarUrl)}
                style={[
                  styles.avatarOption,
                  selectedAvatar === avatarUrl && styles.avatarSelected,
                ]}
              >
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Your Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio (Optional)</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={AppColors.white} />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 2,
  },
  avatarSelected: {
    borderColor: AppColors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: AppColors.inputBackground,
    color: AppColors.text,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
