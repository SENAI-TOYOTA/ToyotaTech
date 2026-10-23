import { useRouter } from "expo-router";
import { Check, LogOut } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormMessage from "@/components/ui/FormMessage";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "T";
  }
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${parts[0][0]}${last}`.toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const isWide = useIsWide();
  const { signOut, user, token } = useAuth();
  const {
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    cpf,
    setCpf,
    isCpfLocked,
    isLoadingProfile,
    isSaving,
    formError,
    saveProfile,
    formatBirthDate,
    formatCpf,
  } = useProfileForm();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const email = user?.email ?? "";
  const displayName = fullName || user?.name || email;

  const handleSave = async () => {
    setSavedMessage(null);
    const saved = await saveProfile();
    if (saved) {
      setSavedMessage("Your profile was updated.");
    }
  };

  return (
    <Screen maxWidth={960}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="ACCOUNT"
          title="Profile"
          subtitle="Manage your personal information."
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <Card>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName || "Toyota customer"}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {email}
              </Text>
            </View>
            {user?.isVerified ? (
              <Badge label="Verified" tone="success" />
            ) : null}
          </View>
        </Card>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(160).duration(400)}
        style={[styles.columns, isWide && styles.columnsWide]}
      >
        <Card
          title="Personal information"
          subtitle="Used to link your purchase and documents."
          style={isWide ? styles.column : undefined}
        >
          <View style={styles.form}>
            <TextInput
              label="Full name"
              placeholder="Your full name"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              label="Birth date"
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChangeText={(text) => setBirthDate(formatBirthDate(text))}
              keyboardType="numeric"
              maxLength={10}
            />
            <TextInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCpf(text))}
              keyboardType="numeric"
              maxLength={14}
              editable={!isCpfLocked}
              hint={
                isCpfLocked
                  ? "Your CPF is linked to your purchase and cannot be changed."
                  : undefined
              }
            />
          </View>
        </Card>

        <Card
          title="Sign-in details"
          subtitle="Credentials used to access ToyotaTech."
          style={isWide ? styles.column : undefined}
        >
          <View style={styles.form}>
            <TextInput label="Email" value={email} editable={false} />
            <TextInput
              label="Password"
              value="********"
              secureTextEntry
              editable={false}
            />
          </View>
        </Card>
      </Animated.View>

      <FormMessage message={formError} />
      <FormMessage message={savedMessage} tone="success" />

      <View style={[styles.actions, isWide && styles.actionsWide]}>
        <Button
          title="Sign out"
          variant="danger"
          iconPosition="left"
          icon={<LogOut size={18} strokeWidth={2} color={colors.primary} />}
          style={isWide ? styles.actionWide : undefined}
          onPress={async () => {
            await signOut();
            router.replace("/");
          }}
        />
        <Button
          title={isSaving ? "Saving..." : "Save changes"}
          loading={isSaving}
          iconPosition="left"
          icon={<Check size={18} strokeWidth={2.4} color={colors.white} />}
          style={isWide ? styles.actionWide : undefined}
          disabled={isLoadingProfile || !token}
          onPress={handleSave}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.white,
    letterSpacing: 0.5,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg + 2,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm + 2,
  },
  actionsWide: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionWide: {
    width: 220,
  },
});
