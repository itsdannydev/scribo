import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '../components/ui/ThemedText';
import { ThemedView } from '../components/ui/ThemedView';
import { useAppTheme } from '../hooks/useColorScheme';
import { setOnboardingDone } from '../storage/settings';
import { RootStackParamList } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_PAD = 28;

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

// ─── Pulsing tap indicator ────────────────────────────────────────────────────

function PulsingDot({ color }: { color: string }) {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2.5, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(withTiming(0, { duration: 1100 }), -1, false);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color },
          ringStyle,
        ]}
      />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
    </View>
  );
}

// ─── Slide 2: Master list — add item bar ──────────────────────────────────────

function MasterListMockup() {
  const { theme } = useAppTheme();
  const items = [
    { name: 'Rice', qty: '2 kg' },
    { name: 'Oil', qty: '1 L' },
    { name: 'Dal', qty: '500 g' },
  ];
  return (
    <View style={{ width: '100%' }}>
      {/* List items card */}
      <View
        style={{
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
        }}
      >
        {/* List header */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 14, paddingVertical: 12,
            borderBottomWidth: 1, borderBottomColor: theme.border, gap: 10,
          }}
        >
          <View
            style={{
              width: 34, height: 34, borderRadius: 10,
              backgroundColor: theme.accentDim, borderWidth: 1, borderColor: theme.accentBorder,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Feather name="clipboard" size={15} color={theme.accentText} />
          </View>
          <ThemedText size="sm" weight="semibold">Grocery List</ThemedText>
        </View>

        {/* Items */}
        {items.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row', alignItems: 'center',
              paddingHorizontal: 14, paddingVertical: 11,
              borderBottomWidth: i < items.length - 1 ? 1 : 0,
              borderBottomColor: theme.border, gap: 10,
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.accent }} />
            <ThemedText size="sm" weight="medium" style={{ flex: 1 }}>{item.name}</ThemedText>
            <View
              style={{
                backgroundColor: theme.accentDim, borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 3,
                borderWidth: 1, borderColor: theme.accentBorder,
              }}
            >
              <ThemedText size="xs" style={{ color: theme.accentText }}>{item.qty}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Split bar — matches actual app: surface bg, two pill inputs side by side */}
      <View
        style={{
          backgroundColor: theme.surface,
          borderTopWidth: 1, borderTopColor: theme.border,
          flexDirection: 'row',
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8,
          gap: 8,
        }}
      >
        {/* Add item pill */}
        <View
          style={{
            flex: 1, height: 44,
            backgroundColor: theme.card,
            borderWidth: 1, borderColor: theme.accentBorder,
            borderRadius: 12,
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 12, gap: 8,
          }}
        >
          <PulsingDot color={theme.accent} />
          <ThemedText size="sm" variant="muted">Add item</ThemedText>
        </View>

        {/* Search pill */}
        <View
          style={{
            flex: 1, height: 44,
            backgroundColor: theme.card,
            borderWidth: 1, borderColor: theme.border,
            borderRadius: 12,
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 12, gap: 8,
          }}
        >
          <Feather name="search" size={14} color={theme.textMuted} />
          <ThemedText size="sm" variant="muted">Search...</ThemedText>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 3: Stock entry + generate ─────────────────────────────────────────

function StockEntryMockup() {
  const { theme } = useAppTheme();
  const rows = [
    { name: 'Rice', need: 'need 2 kg', have: '1 kg', unit: 'kg', active: true },
    { name: 'Oil', need: 'need 1 L', have: '', unit: 'L', active: false },
  ];
  return (
    <View style={{ width: '100%', gap: 8 }}>
      {rows.map((row, i) => (
        <View
          key={i}
          style={{
            backgroundColor: theme.card, borderRadius: 12,
            borderWidth: 1, borderColor: row.active ? theme.accentBorder : theme.border,
            padding: 12, opacity: row.active ? 1 : 0.55,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <ThemedText size="sm" weight="semibold">{row.name}</ThemedText>
            <ThemedText size="xs" variant="muted">{row.need}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemedText size="xs" variant="muted" style={{ width: 36 }}>I have</ThemedText>
            {row.active && <PulsingDot color={theme.accent} />}
            <View
              style={{
                flex: 1, height: 36, borderRadius: 8,
                borderWidth: row.active ? 2 : 1,
                borderColor: row.active ? theme.accent : theme.border,
                backgroundColor: row.active ? theme.accentDim : theme.card,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ThemedText size="sm" style={{ color: row.active ? theme.accentText : theme.textMuted }}>
                {row.have}
              </ThemedText>
            </View>
            <View
              style={{
                borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
                backgroundColor: theme.accentDim, borderWidth: 1,
                borderColor: row.active ? theme.accent : theme.accentBorder,
              }}
            >
              <ThemedText size="xs" weight="semibold" style={{ color: theme.accentText }}>
                {row.unit}
              </ThemedText>
            </View>
          </View>
        </View>
      ))}

      {/* Generate button */}
      <View
        style={{
          backgroundColor: theme.accent, borderRadius: 12,
          paddingVertical: 13, marginTop: 2,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Feather name="shopping-cart" size={14} color="#fff" />
        <ThemedText size="sm" weight="semibold" style={{ color: '#fff' }}>Generate Shopping List</ThemedText>
      </View>
    </View>
  );
}

// ─── Slide 4: Home screen — Lists button ──────────────────────────────────────

function HomeListsMockup() {
  const { theme } = useAppTheme();
  return (
    <View style={{ width: '100%', gap: 10 }}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2 }}>
        <View
          style={{
            width: 34, height: 34, borderRadius: 10,
            backgroundColor: theme.accentDim, borderWidth: 1, borderColor: theme.accentBorder,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="shopping-bag" size={16} color={theme.accentText} />
        </View>
        <View style={{ flex: 1 }} />

        {/* Lists pill — highlighted to draw attention */}
        <View style={{ position: 'relative' }}>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
              borderWidth: 1.5, borderColor: theme.accent,
              backgroundColor: theme.accentDim,
            }}
          >
            <Feather name="shopping-bag" size={14} color={theme.accentText} />
            <ThemedText size="xs" weight="medium" style={{ color: theme.accentText }}>Lists</ThemedText>
          </View>
          {/* Pulse in top-right corner */}
          <View style={{ position: 'absolute', top: -6, right: -6 }}>
            <PulsingDot color={theme.accent} />
          </View>
        </View>

        <View
          style={{
            width: 36, height: 36, borderRadius: 10,
            borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card,
            alignItems: 'center', justifyContent: 'center', marginLeft: 4,
          }}
        >
          <Feather name="settings" size={15} color={theme.textMuted} />
        </View>
      </View>

      {/* List card */}
      <View
        style={{
          backgroundColor: theme.card, borderRadius: 16,
          borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
        }}
      >
        <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: theme.accentDim, borderWidth: 1, borderColor: theme.accentBorder,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Feather name="clipboard" size={16} color={theme.accentText} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText size="sm" weight="semibold">Grocery List</ThemedText>
            <ThemedText size="xs" variant="muted" style={{ marginTop: 2 }}>18 items</ThemedText>
          </View>
        </View>
        <View
          style={{
            backgroundColor: theme.accent, paddingVertical: 11,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Feather name="shopping-cart" size={13} color="#fff" />
          <ThemedText size="xs" weight="semibold" style={{ color: '#fff' }}>Start Shopping</ThemedText>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 5: Shopping list — check off items ─────────────────────────────────

function TrackingMockup() {
  const { theme } = useAppTheme();
  return (
    <View style={{ width: '100%', gap: 8 }}>
      {/* Progress bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 }}>
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.border, overflow: 'hidden' }}>
          <View style={{ width: '33%', height: '100%', borderRadius: 3, backgroundColor: theme.accent }} />
        </View>
        <ThemedText size="xs" variant="muted">1 / 3</ThemedText>
      </View>

      {/* Unchecked — pulse where checkbox is */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          backgroundColor: theme.card, borderRadius: 14,
          borderWidth: 1, borderColor: theme.border,
          paddingHorizontal: 14, paddingVertical: 13,
        }}
      >
        <PulsingDot color={theme.accent} />
        <ThemedText size="sm" weight="medium" style={{ flex: 1 }}>Rice</ThemedText>
        <View
          style={{
            backgroundColor: theme.accentDim, borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: theme.accentBorder,
          }}
        >
          <ThemedText size="sm" weight="semibold" style={{ color: theme.accentText }}>2 kg</ThemedText>
        </View>
      </View>

      {/* Unchecked — dimmed */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          backgroundColor: theme.card, borderRadius: 14,
          borderWidth: 1, borderColor: theme.border,
          paddingHorizontal: 14, paddingVertical: 13, opacity: 0.5,
        }}
      >
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.border }} />
        <ThemedText size="sm" weight="medium" style={{ flex: 1 }}>Oil</ThemedText>
        <View
          style={{
            backgroundColor: theme.accentDim, borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: theme.accentBorder,
          }}
        >
          <ThemedText size="sm" weight="semibold" style={{ color: theme.accentText }}>1 L</ThemedText>
        </View>
      </View>

      {/* Checked */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          backgroundColor: theme.card, borderRadius: 14,
          borderWidth: 1, borderColor: theme.borderMuted,
          paddingHorizontal: 14, paddingVertical: 13, opacity: 0.38,
        }}
      >
        <View
          style={{
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Feather name="check" size={11} color="#fff" />
        </View>
        <ThemedText size="sm" weight="medium" strikethrough style={{ flex: 1, color: theme.textMuted }}>
          Dal
        </ThemedText>
        <View
          style={{
            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
            borderWidth: 1, borderColor: theme.border,
          }}
        >
          <ThemedText size="sm" weight="semibold" style={{ color: theme.textMuted }}>500 g</ThemedText>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 6: Partial buy bottom sheet ───────────────────────────────────────

function PartialBuyMockup() {
  const { theme } = useAppTheme();
  return (
    <View style={{ width: '100%', gap: 8 }}>
      {/* List item — pulse is on the qty badge (that's what you tap to open partial buy) */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          backgroundColor: theme.card, borderRadius: 14,
          borderWidth: 1, borderColor: theme.border,
          paddingHorizontal: 14, paddingVertical: 13,
        }}
      >
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.border }} />
        <ThemedText size="sm" weight="medium" style={{ flex: 1 }}>Rice</ThemedText>
        {/* Qty badge with pulse in top-right corner */}
        <View style={{ position: 'relative' }}>
          <View
            style={{
              backgroundColor: theme.accentDim, borderRadius: 8,
              paddingHorizontal: 10, paddingVertical: 5,
              borderWidth: 1, borderColor: theme.accentBorder,
            }}
          >
            <ThemedText size="sm" weight="semibold" style={{ color: theme.accentText }}>2 kg</ThemedText>
          </View>
          <View style={{ position: 'absolute', top: -7, right: -7 }}>
            <PulsingDot color={theme.accent} />
          </View>
        </View>
      </View>

      {/* Bottom sheet */}
      <View
        style={{
          backgroundColor: theme.card, borderRadius: 16,
          borderWidth: 1, borderColor: theme.border,
          padding: 16, gap: 12,
        }}
      >
        {/* Header */}
        <View>
          <ThemedText size="base" weight="semibold">Rice</ThemedText>
          <ThemedText size="xs" variant="muted" style={{ marginTop: 3 }}>
            Need 2 kg · how much did you get?
          </ThemedText>
        </View>

        {/* Qty input row */}
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: theme.background ?? theme.surface,
            borderRadius: 10, borderWidth: 1, borderColor: theme.border,
            paddingHorizontal: 14, paddingVertical: 10,
          }}
        >
          <ThemedText size="xs" variant="muted">Qty</ThemedText>
          <View style={{ flex: 1 }}>
            <View style={{ width: 2, height: 16, backgroundColor: theme.accent }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View
              style={{
                borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                borderWidth: 1, borderColor: theme.border,
              }}
            >
              <ThemedText size="xs" variant="muted">kg</ThemedText>
            </View>
            <View
              style={{
                borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                backgroundColor: theme.accent,
              }}
            >
              <ThemedText size="xs" weight="semibold" style={{ color: '#fff' }}>g</ThemedText>
            </View>
          </View>
        </View>

        {/* Got it button */}
        <View
          style={{
            backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 13,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ThemedText size="sm" weight="semibold" style={{ color: '#fff' }}>Got it</ThemedText>
        </View>
      </View>
    </View>
  );
}

// ─── Slide definitions ────────────────────────────────────────────────────────

type SlideData = {
  title: string;
  description: string;
  Mockup: (() => React.ReactElement) | null;
  icon?: React.ComponentProps<typeof Feather>['name'];
};

const SLIDES: SlideData[] = [
  {
    title: 'Welcome to Scribo',
    description: 'Your smart shopping companion.\nNo cloud. No ads. Just your lists.',
    icon: 'home',
    Mockup: null,
  },
  {
    title: 'Build your master list',
    description: "Tap 'Add item' to add everything you buy regularly — Rice, Oil, Dal — with the usual quantity.",
    Mockup: MasterListMockup,
  },
  {
    title: 'Check your stock & generate',
    description: 'Enter how much you already have at home. Scribo calculates exactly what you need to buy.',
    Mockup: StockEntryMockup,
  },
  {
    title: 'Find your shopping lists',
    description: "Tap 'Lists' in the top-right corner of the home screen to open your generated shopping trips.",
    Mockup: HomeListsMockup,
  },
  {
    title: 'Track as you shop',
    description: 'Tap the checkbox to mark an item as bought. Checked items move to the bottom automatically.',
    Mockup: TrackingMockup,
  },
  {
    title: 'Partial buy',
    description: "Got less than needed? Tap the quantity badge, enter what you got, then tap 'Got it'. The rest stays on your list.",
    Mockup: PartialBuyMockup,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export function OnboardingScreen({ navigation }: Props) {
  const { theme, isDark } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const finish = async () => {
    await setOnboardingDone();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const handleNext = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_W, animated: true });
    } else {
      finish();
    }
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (newPage !== page) setPage(newPage);
  };

  const isLast = page === SLIDES.length - 1;

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Skip */}
        <View style={{ height: 48, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20 }}>
          {!isLast && (
            <TouchableOpacity onPress={finish} hitSlop={12}>
              <ThemedText size="sm" variant="muted">Skip</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={32}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide, i) => {
            const { Mockup } = slide;
            return (
              <View
                key={i}
                style={{
                  width: SCREEN_W,
                  paddingHorizontal: SLIDE_PAD,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20,
                }}
              >
                {Mockup ? (
                  <Mockup />
                ) : (
                  <View
                    style={{
                      width: 96, height: 96, borderRadius: 28,
                      backgroundColor: theme.accentDim, borderWidth: 1, borderColor: theme.accentBorder,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Feather name={slide.icon!} size={44} color={theme.accentText} />
                  </View>
                )}

                <ThemedText size="xl" weight="bold" style={{ textAlign: 'center' }}>
                  {slide.title}
                </ThemedText>
                <ThemedText
                  variant="muted"
                  style={{ textAlign: 'center', lineHeight: 22, fontSize: 14 }}
                >
                  {slide.description}
                </ThemedText>
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom bar */}
        <View style={{ paddingHorizontal: 32, paddingBottom: 8, alignItems: 'center', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 7,
                  width: i === page ? 26 : 7,
                  borderRadius: 3.5,
                  backgroundColor: i === page ? theme.accent : theme.border,
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.accent,
              borderRadius: 14,
              paddingVertical: 15,
              alignSelf: 'stretch',
              alignItems: 'center',
            }}
          >
            <ThemedText weight="semibold" size="base" style={{ color: '#fff' }}>
              {isLast ? 'Get Started' : 'Next'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
