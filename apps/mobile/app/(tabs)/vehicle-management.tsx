import {
  FileText,
  FolderOpen,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react-native";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ListRow from "@/components/ui/ListRow";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { useGarage } from "@/hooks/useGarage";
import { t } from "@/i18n";
import { colors, spacing } from "@/theme";
import { GarageDocument, GarageRecall } from "@/types/garage";

const documentDatePattern =
  /(?:\s*[-|,]\s*)?(?:\(?\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b\)?|\(?\b\d{4}[./-]\d{1,2}[./-]\d{1,2}\b\)?)/g;

function getDocumentDisplayTitle(title: string) {
  const sanitizedTitle = title
    .replace(documentDatePattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return sanitizedTitle || title;
}

function openDocument(document: GarageDocument) {
  if (document.url) {
    void Linking.openURL(document.url);
  }
}

function DocumentsCard({
  documents,
  isLoading,
}: {
  documents: GarageDocument[];
  isLoading: boolean;
}) {
  return (
    <Card
      title="Digital documents"
      subtitle="Your vehicle paperwork, always at hand."
      padded={false}
      action={
        documents.length ? (
          <Badge
            label={t("{count} files", { count: documents.length })}
            tone="neutral"
          />
        ) : null
      }
    >
      {isLoading && !documents.length ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : documents.length ? (
        documents.map((document, index) => {
          const isAvailable = document.status === "available";
          return (
            <ListRow
              key={document.id}
              icon={FileText}
              iconTone={isAvailable ? "primary" : "neutral"}
              title={getDocumentDisplayTitle(document.title)}
              subtitle={document.date}
              showDivider={index > 0}
              trailing={
                <Badge
                  label={isAvailable ? "Available" : "Pending"}
                  tone={isAvailable ? "success" : "warning"}
                />
              }
              onPress={
                isAvailable && document.url
                  ? () => openDocument(document)
                  : undefined
              }
            />
          );
        })
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No linked documents"
          description="Documents issued for your vehicle will show up here."
          style={styles.emptyPadded}
        />
      )}
    </Card>
  );
}

function RecallsCard({ recalls }: { recalls: GarageRecall[] }) {
  return (
    <Card
      title="Recall programs"
      subtitle="Notifications and mandatory repair scheduling."
      padded={false}
    >
      {recalls.length ? (
        recalls.map((recall, index) => (
          <ListRow
            key={recall.id}
            icon={ShieldAlert}
            iconTone="warning"
            title={recall.title}
            subtitle={recall.description}
            showDivider={index > 0}
            trailing={
              recall.status ? (
                <Badge label={recall.status} tone="warning" />
              ) : null
            }
          />
        ))
      ) : (
        <EmptyState
          icon={ShieldCheck}
          tone="success"
          title="No recalls registered"
          description="Your vehicle has no open recall campaigns."
          style={styles.emptyPadded}
        />
      )}
    </Card>
  );
}

export default function VehicleManagementScreen() {
  const isWide = useIsWide();
  const { garage, isLoading } = useGarage();

  const documents = garage?.documents ?? [];
  const recalls = garage?.recalls ?? [];

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="MY VEHICLE"
          title="Vehicle management"
          subtitle="Digital documents, reminders and more."
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(400)}
        style={[styles.columns, isWide && styles.columnsWide]}
      >
        <View style={isWide ? styles.column : styles.columnNarrow}>
          <DocumentsCard documents={documents} isLoading={isLoading} />
        </View>
        <View style={isWide ? styles.column : styles.columnNarrow}>
          <RecallsCard recalls={recalls} />
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  columnNarrow: {
    width: "100%",
  },
  loading: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyPadded: {
    paddingBottom: spacing.xl,
  },
});
