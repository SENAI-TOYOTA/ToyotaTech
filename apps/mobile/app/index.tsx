
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

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="car-sport" size={32} color="#FFFFFF" />
        <Text style={styles.logo}>TOYOTA TECH</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo ao Toyota Tech</Text>
        <Text style={styles.description}>
          Tecnologia e praticidade para acompanhar os serviços do seu veículo.
        </Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/chatbot")}
          accessibilityRole="button"
        >
          <Ionicons name="chatbubbles" size={34} color="#D71920" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Assistente virtual</Text>
            <Text style={styles.cardDescription}>
              Tire dúvidas e consulte informações sobre seu veículo.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D71920" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/revisao")}
          accessibilityRole="button"
        >
          <Ionicons name="calendar" size={34} color="#D71920" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Revisão</Text>
            <Text style={styles.cardDescription}>
              Acesse a área de revisão do veículo.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#D71920" />
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Toyota Tech · Pós-venda conectado</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#D71920",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 18,
  },
  title: {
    color: "#222222",
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    color: "#666666",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EEEEEE",
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: "#222222",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    color: "#777777",
    textAlign: "center",
    padding: 18,
  },
});
