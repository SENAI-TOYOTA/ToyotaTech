import {
  Car,
  Check,
  Cpu,
  Minus,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import FormMessage from "@/components/ui/FormMessage";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import {
  formatCurrency,
  Product,
  productCategories,
  products,
} from "@/constants/engagement";
import {
  addToCart,
  changeQuantity,
  checkout,
  getCartTotal,
  useEngagement,
} from "@/hooks/useEngagement";
import { formatNumber, t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";

const categoryIcons: Record<string, typeof Car> = {
  Accessories: Car,
  Care: Sparkles,
  Technology: Cpu,
  Collection: Shirt,
};

const perks = [
  { icon: ShieldCheck, text: "Genuine parts with factory warranty" },
  { icon: Truck, text: "Pick up at your dealership" },
  { icon: Sparkles, text: "Earn 1 point for every R$ 1" },
];

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const Icon = categoryIcons[product.category] ?? ShoppingBag;

  return (
    <View style={styles.product}>
      <View style={styles.productImage}>
        <Icon size={44} strokeWidth={1.4} color={colors.white} />
        <Text style={styles.productCategory}>{t(product.category)}</Text>
      </View>
      <View style={styles.productBody}>
        <Text style={styles.productName}>{t(product.name)}</Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
        <Text style={styles.productPoints}>
          {t("Earn {points} points", { points: formatNumber(product.points) })}
        </Text>
        <Button
          title={added ? "Added" : "Add to cart"}
          size="md"
          variant={added ? "secondary" : "primary"}
          iconPosition="left"
          icon={
            added ? (
              <Check size={16} strokeWidth={2.4} color={colors.white} />
            ) : (
              <ShoppingCart size={16} strokeWidth={2} color={colors.white} />
            )
          }
          style={styles.productButton}
          onPress={() => {
            addToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
        />
      </View>
    </View>
  );
}

function CartCard() {
  const { cart } = useEngagement();
  const [message, setMessage] = useState<string | null>(null);
  const total = getCartTotal(cart);

  return (
    <Card title="Your cart">
      {cart.length ? (
        <View style={styles.cartList}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <View style={styles.cartText}>
                <Text style={styles.cartName}>{t(item.product.name)}</Text>
                <Text style={styles.cartPrice}>
                  {formatCurrency(item.product.price * item.quantity)}
                </Text>
              </View>
              <View style={styles.qty}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("Remove one")}
                  style={styles.qtyButton}
                  onPress={() => changeQuantity(item.product.id, -1)}
                >
                  <Minus
                    size={14}
                    strokeWidth={2.4}
                    color={colors.textPrimary}
                  />
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("Add one")}
                  style={styles.qtyButton}
                  onPress={() => changeQuantity(item.product.id, 1)}
                >
                  <Plus
                    size={14}
                    strokeWidth={2.4}
                    color={colors.textPrimary}
                  />
                </Pressable>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t("Total")}</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
          <Text style={styles.earnText}>
            {t("You will earn {points} points with this order.", {
              points: formatNumber(Math.floor(total)),
            })}
          </Text>
          <Button
            title="Place order"
            onPress={() => {
              const earned = checkout();
              setMessage(
                t(
                  "Order placed! Pick it up at your dealership. You earned {points} points.",
                  { points: formatNumber(earned) }
                )
              );
            }}
          />
        </View>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add genuine accessories and products to your cart."
        />
      )}
      <FormMessage message={message} tone="success" style={styles.message} />
    </Card>
  );
}

export default function StoreScreen() {
  const isWide = useIsWide();
  const [category, setCategory] = useState("All");
  const { cart } = useEngagement();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const filtered = useMemo(
    () =>
      category === "All"
        ? products
        : products.filter((product) => product.category === category),
    [category]
  );

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="TOYOTA STORE"
          title="Toyota Store"
          subtitle="Genuine accessories, care products and the Toyota collection."
          action={
            <View style={styles.cartBadge}>
              <ShoppingCart size={18} strokeWidth={2} color={colors.white} />
              <Text style={styles.cartBadgeText}>{count}</Text>
            </View>
          }
        />
      </Animated.View>

      <View style={styles.perks}>
        {perks.map(({ icon: Icon, text }) => (
          <View key={text} style={styles.perk}>
            <Icon size={18} strokeWidth={1.8} color={colors.primary} />
            <Text style={styles.perkText}>{t(text)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chips}>
        {productCategories.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={item === category}
            onPress={() => setCategory(item)}
          />
        ))}
      </View>

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.grid, isWide && styles.gridWide]}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
        <View style={isWide ? styles.cartWide : undefined}>
          <CartCard />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
  },
  cartBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  perks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  perk: {
    flexGrow: 1,
    flexBasis: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md - 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  perkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md - 4,
  },
  gridWide: {
    flex: 1,
  },
  cartWide: {
    width: 340,
  },
  product: {
    flexGrow: 1,
    flexBasis: 200,
    maxWidth: 360,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  productImage: {
    height: 130,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  productCategory: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    letterSpacing: 1,
    color: colors.textInverseMuted,
    textTransform: "uppercase",
  },
  productBody: {
    padding: spacing.md,
  },
  productName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
    minHeight: 44,
  },
  productPrice: {
    marginTop: spacing.xs,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  productPoints: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  productButton: {
    marginTop: spacing.md - 4,
  },
  cartList: {
    gap: spacing.md - 4,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cartText: {
    flex: 1,
  },
  cartName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  cartPrice: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    minWidth: 16,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.md - 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg - 2,
    color: colors.textPrimary,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  earnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  message: {
    marginTop: spacing.md - 4,
  },
});
