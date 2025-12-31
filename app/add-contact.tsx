import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChatContext } from '../context/ChatContext';
import { mockAvatarOptions } from '../mock/data';
import { AppColors } from '../constants/colors';

export default function AddContactScreen() {
  const router = useRouter();
  const { addContact } = useChatContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(mockAvatarOptions[3]);

  const handleAddContact = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      await addContact(email);
      router.back();
    } catch (error) {
      alert('Failed to add contact. Please make sure the email is registered.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Contact</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Choose Avatar</Text>
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
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAddContact}>
          <Text style={styles.buttonText}>Add Contact</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  backButton: {
    fontSize: 16,
    color: AppColors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text,
  },
  content: {
    padding: 20,
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
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
