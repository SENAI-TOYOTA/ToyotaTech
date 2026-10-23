import { useRouter } from "expo-router";
import {
  CalendarPlus,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Search,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import BackLink from "@/components/ui/BackLink";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import WebEmbed from "@/components/ui/WebEmbed";
import { Dealership, dealerships } from "@/constants/aftersales";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

function getQuery(dealer: Dealership) {
  return encodeURIComponent(
    `${dealer.name}, ${dealer.address}, ${dealer.city}`
  );
}

function openDirections(dealer: Dealership) {
  void Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${getQuery(dealer)}`
  );
}

function MapCard({ dealer }: { dealer: Dealership }) {
  return (
    <Card padded={false}>
      <WebEmbed
        src={`https://www.google.com/maps?q=${getQuery(dealer)}&output=embed`}
        title={t(dealer.name)}
        style={styles.map}
      />
      <View style={styles.mapBody}>
        <Text style={styles.mapTitle}>{t(dealer.name)}</Text>
        <Text style={styles.mapText}>
          {dealer.address}, {t(dealer.city)}
        </Text>
        <Button
          title="Get directions"
          size="md"
          iconPosition="left"
          icon={<Navigation size={16} strokeWidth={2} color={colors.white} />}
          style={styles.directions}
          onPress={() => openDirections(dealer)}
        />
      </View>
    </Card>
  );
}

function InfoLine({ icon: Icon, text }: { icon: typeof Phone; text: string }) {
  return (
    <View style={styles.infoLine}>
      <Icon size={16} strokeWidth={1.8} color={colors.textMuted} />
      <Text style={styles.infoText}>{t(text)}</Text>
    </View>
  );
}

function DealerCard({
  dealer,
  selected,
  onSelect,
}: {
  dealer: Dealership;
  selected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="button"
      style={[styles.cardWrap, selected && styles.cardSelected]}
    >
      <Card style={styles.card}>
        <Text style={styles.name}>{t(dealer.name)}</Text>
        <View style={styles.info}>
          <InfoLine
            icon={MapPin}
            text={`${dealer.address}, ${t(dealer.city)}`}
          />
          <InfoLine icon={Clock} text={dealer.hours} />
          <InfoLine icon={Phone} text={dealer.phone} />
        </View>
        <View style={styles.badges}>
          {dealer.services.map((service) => (
            <Badge key={service} label={service} tone="neutral" />
          ))}
        </View>
        <View style={styles.actions}>
          <Button
            title="Call"
            variant="outline"
            size="md"
            iconPosition="left"
            icon={
              <Phone size={16} strokeWidth={2} color={colors.textPrimary} />
            }
            style={styles.action}
            onPress={() =>
              void Linking.openURL(`tel:${dealer.phone.replace(/[^\d+]/g, "")}`)
            }
          />
          <Button
            title="Book"
            size="md"
            iconPosition="left"
            icon={
              <CalendarPlus size={16} strokeWidth={2} color={colors.white} />
            }
            style={styles.action}
            onPress={() => router.push("/schedule-service")}
          />
        </View>
      </Card>
    </Pressable>
  );
}

export default function DealersScreen() {
  const isWide = useIsWide();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(dealerships[0].id);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return dealerships;
    }
    return dealerships.filter((dealer) =>
      `${dealer.name} ${dealer.city}`.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <Screen>
      <View style={styles.header}>
        <BackLink fallback="/services" />
        <ScreenSectionHeader
          title="Dealerships"
          subtitle="Authorized Toyota service near you."
        />
      </View>

      <TextInput
        placeholder="Search by name or city"
        value={query}
        onChangeText={setQuery}
        rightAccessory={
          <Search size={18} strokeWidth={1.8} color={colors.textMuted} />
        }
      />

      {filtered.length ? (
        <View style={[styles.columns, isWide && styles.columnsWide]}>
          <View style={[styles.mapColumn, isWide && styles.mapColumnWide]}>
            <MapCard
              dealer={
                filtered.find((dealer) => dealer.id === selectedId) ??
                filtered[0]
              }
            />
          </View>
          <View style={[styles.grid, isWide && styles.gridWide]}>
            {filtered.map((dealer) => (
              <DealerCard
                key={dealer.id}
                dealer={dealer}
                selected={dealer.id === selectedId}
                onSelect={() => setSelectedId(dealer.id)}
              />
            ))}
          </View>
        </View>
      ) : (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No dealership found"
            description="Try another name or city."
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md - 4,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  mapColumn: {
    width: "100%",
  },
  mapColumnWide: {
    flex: 1.2,
  },
  map: {
    height: 320,
    borderRadius: 0,
  },
  mapBody: {
    padding: spacing.lg - 4,
  },
  mapTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  mapText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    color: colors.textSecondary,
  },
  directions: {
    marginTop: spacing.md - 4,
    alignSelf: "flex-start",
    width: "auto",
  },
  grid: {
    gap: spacing.md - 4,
  },
  gridWide: {
    flex: 1,
  },
  cardWrap: {
    borderRadius: radius.lg + 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  card: {},
  name: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  info: {
    marginTop: spacing.sm + 2,
    gap: 6,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    color: colors.textSecondary,
  },
  badges: {
    marginTop: spacing.md - 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  actions: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  action: {
    flex: 1,
    width: "auto",
  },
});
