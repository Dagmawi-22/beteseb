import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useChatContext } from "../../context/ChatContext";
import { mockAvatarOptions } from "../../mock/data";
import { AppColors } from "../../constants/colors";

export default function ProfileScreen() {
  const { currentUser, updateCurrentUser } = useChatContext();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser.avatar || mockAvatarOptions[0]
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }

    updateCurrentUser({
      name,
      email,
      bio,
      avatar: selectedAvatar,
    });

    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setBio(currentUser.bio || "");
    setSelectedAvatar(currentUser.avatar || mockAvatarOptions[0]);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <Image source={{ uri: selectedAvatar }} style={styles.mainAvatar} />
          {isEditing && (
            <Text style={styles.avatarLabel}>Choose Your Avatar</Text>
          )}
        </View>

        {isEditing && (
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
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[
              styles.input,
              styles.bioInput,
              !isEditing && styles.inputDisabled,
            ]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            editable={isEditing}
            placeholderTextColor={AppColors.textTertiary}
          />
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderLight,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: AppColors.text,
  },
  editButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: AppColors.disabledBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: AppColors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: AppColors.primary,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "transparent",
    padding: 2,
  },
  avatarSelected: {
    borderColor: AppColors.primary,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 8,
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
  inputDisabled: {
    backgroundColor: AppColors.disabledBackground,
    color: AppColors.textSecondary,
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  statsSection: {
    marginTop: 24,
  },
  statCard: {
    backgroundColor: AppColors.inputBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
});
