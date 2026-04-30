import { Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";

import Logo from "@/components/Logo";
import { colors, fonts } from "@/constants/theme";

const mainCarImage = require("@/assets/images/corolla-main.png");
const sideCarImage = require("@/assets/images/corolla-side.png");
const newsImage = require("@/assets/images/corolla-news.png");

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.logoContainer}>
            <Logo size={36} />
          </View>

          <Text style={styles.welcomeText}>Bem vindo, Usuário!</Text>

          <View style={styles.showcaseContainer}>
            <Image source={mainCarImage} style={styles.mainImage} resizeMode="cover" />
            <Image source={sideCarImage} style={styles.sideImage} resizeMode="cover" />

            <View style={styles.carLabel}>
              <Text style={styles.carLabelText}>Seu Corolla Altis</Text>
            </View>
          </View>

          <View style={styles.statusButtonWrapper}>
            <View style={styles.statusButtonShadow} />
            <Pressable style={styles.statusButton} android_ripple={{ color: "#c70818" }}>
              <Text style={styles.statusButtonText}>Vericar Status</Text>
              <ArrowRight size={24} strokeWidth={2.6} color={colors.white} />
            </Pressable>
          </View>

          <Pressable style={styles.newsButton} android_ripple={{ color: "#f2f2f2" }}>
            <Text style={styles.newsButtonText}>Novidades</Text>
            <ArrowRight size={22} strokeWidth={1.6} color={colors.black} />
          </Pressable>

          <Image source={newsImage} style={styles.newsImage} resizeMode="cover" />
        </ScrollView>

        <View style={styles.navigationBar}>
          <CircleDollarSign size={22} strokeWidth={1.8} color={colors.black} />
          <CarFront size={22} strokeWidth={1.8} color={colors.black} />
          <Bell size={22} strokeWidth={1.8} color={colors.black} />
          <User size={22} strokeWidth={1.8} color={colors.black} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 27,
    paddingBottom: 90,
  },
  logoContainer: {
    alignSelf: "flex-start",
  },
  welcomeText: {
    marginTop: 52,
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  showcaseContainer: {
    marginTop: 8,
    height: 300,
    overflow: "hidden",
  },
  mainImage: {
    position: "absolute",
    width: 300,
    height: 300,
    left: 0,
    top: 0,
  },
  sideImage: {
    position: "absolute",
    width: 300,
    height: 300,
    left: 331,
    top: 0,
  },
  carLabel: {
    position: "absolute",
    left: 15,
    bottom: 25,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  carLabelText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.black,
  },
  statusButtonWrapper: {
    width: 251,
    height: 42,
    marginTop: 19,
    marginLeft: 6,
  },
  statusButtonShadow: {
    position: "absolute",
    top: 4,
    left: 6,
    right: -6,
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
  },
  statusButton: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    color: colors.white,
  },
  newsButton: {
    marginTop: 35,
    width: 141,
    height: 29,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  newsButtonText: {
    fontFamily: fonts.regular,
    fontSize: 20,
    color: colors.black,
  },
  newsImage: {
    marginTop: 12,
    width: "100%",
    aspectRatio: 363 / 204,
  },
  navigationBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#d7d7d7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
