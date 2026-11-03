
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RevisaoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Toyota Tech</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="car-sport-outline" size={76} color="#D71920" />

        <Text style={styles.title}>Agendamento de revisão</Text>

        <Text style={styles.description}>
          Consulte e solicite a revisão do seu veículo Toyota.
        </Text>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#D71920"
          />
          <Text style={styles.noticeText}>
            Esta tela está em preparação. A integração com o sistema de
            agendamentos será configurada na próxima etapa.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Voltar ao chatbot</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 64,
    backgroundColor: "#D71920",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#222222",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  description: {
    color: "#555555",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F1",
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: "#444444",
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    backgroundColor: "#D71920",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 28,
    marginTop: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
