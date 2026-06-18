@AGENTS.md

# Project: Shopping List Tracker

Expo SDK 56 React Native app. Local-only shopping lists, no backend.

## Critical Architecture Notes

- **No babel.config.js** — SDK 56 auto-configures Babel including Reanimated worklets plugin
- **No NativeWind** — removed (incompatible with SDK 56 metro). All styling via `useAppTheme()` inline styles
- **No moti** — removed (dual React instance crash). All animations via react-native-reanimated directly
- **New Architecture enabled** — react-native-reanimated 4.3.1, worklets run on UI thread

## Key Patterns

- `useAppTheme()` → returns `{ theme, isDark }` — use for ALL colors, never hardcode
- `ThemedText` with `handwriting` prop → Comic Neue font (Latin) or Chilanka (Malayalam, auto-detected)
- `runOnJS()` required when calling JS functions from inside Reanimated worklet callbacks
- Never mutate a React ref (`.current = ...`) inside a Reanimated worklet — throws "[Worklets] Tried to modify key"
- Percentage `width` in `useAnimatedStyle` is unreliable in Reanimated 4 — use `onLayout` for pixel values instead

## Fonts Loaded in App.tsx

- `ComicNeue_400Regular`, `ComicNeue_700Bold` — handwriting (Latin)
- `Chilanka_400Regular` — handwriting (Malayalam)

## Storage Keys

- `@shopping_lists_v1` — all lists
- `@list_items_v1_{listId}` — items per list
- `@collapsed_sections_v1_{listId}` — collapsed section keys per list (returns `null` if never stored = default collapsed `__completed__`)
