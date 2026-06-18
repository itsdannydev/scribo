# Shopping List Tracker — Full App Description

## Purpose

A personal shopping list app built for everyday use. Fully offline — all data lives locally on the device (AsyncStorage). No accounts, no sync, no backend. Target demographic is women in their mid-30s to 40s, so the UX prioritises visible, tappable controls over hidden swipe gestures.

---

## Tech Stack

- **Expo SDK 56** · React Native 0.85.3 · React 19.2.3 · New Architecture enabled
- **Animations:** react-native-reanimated 4.3.1 (all animations run on the UI thread)
- **Drag-to-reorder:** react-native-draggable-flatlist
- **Haptics:** expo-haptics (light impact on item toggle)
- **Fonts:** Comic Neue (Comic Sans equivalent, open-source) for handwriting feel in Track mode; Chilanka for Malayalam script (auto-detected via Unicode range)
- **Navigation:** React Navigation native stack (`slide_from_right` transition)
- **Storage:** AsyncStorage — lists, items per list, collapsed section state per list

---

## Color Palette

### Dark Theme (pure black / neon emerald — Vercel-inspired)
| Token | Hex | Usage |
|---|---|---|
| `background` | `#000000` | Screen background |
| `surface` | `#0c0c0c` | Elevated surfaces |
| `card` | `#111111` | Cards, dropdowns |
| `border` | `#222222` | Borders |
| `borderMuted` | `#1a1a1a` | Subtle dividers |
| `accent` | `#10b981` | Emerald — primary CTA, progress, toggles |
| `accentBright` | `#34d399` | Accent text on dark backgrounds |
| `accentDim` | `#064e3b` | Accent fill backgrounds (date group pills, active rows) |
| `accentBorder` | `#047857` | Accent borders |
| `text` | `#ffffff` | Primary text |
| `textSecondary` | `#a1a1aa` | Secondary text |
| `textMuted` | `#71717a` | Muted / placeholder text |
| `textDim` | `#3f3f46` | Very dim / disabled text |
| `danger` | `#ef4444` | Delete icons, destructive actions |

### Light Theme (system-adaptive)
| Token | Hex |
|---|---|
| `background` | `#ffffff` |
| `card` | `#f3f4f6` |
| `accent` | `#059669` |
| `accentDim` | `#ecfdf5` |
| `accentBorder` | `#a7f3d0` |
| `text` | `#111827` |
| `danger` | `#ef4444` |

The app auto-switches between dark and light based on the device system setting (`userInterfaceStyle: automatic`).

---

## App Structure — Screens

### 1. Home Screen

**Layout:**
- Header (top): "MY LISTS" label in small emerald caps + "Shopping" as large bold title on the left; settings gear icon on the right
- List of shopping list cards (drag-reorderable, newest first)
- Floating Action Button (FAB) — 60×60 circle, bottom-center, above the home indicator — for creating a new list

**Shopping List Card:**
Each card shows:
- Drag handle (≡ icon, long-press to drag) on the far left
- List name (bold)
- Rename icon (pencil) + Delete icon (trash, red) on the right of the name row
- Progress bar (emerald, animated) below the name
- "X of Y items" count on the left, percentage on the right — percentage turns emerald and adds a ✓ icon when 100%
- Cards have entrance animations (fade in + slide + scale, staggered by index × 40ms)
- Active drag state: card scales up slightly, border turns emerald, emerald glow shadow

**Actions:**
- Tap card → opens list detail
- Long-press drag handle → reorder lists
- Tap pencil icon → rename modal
- Tap trash icon → delete confirmation dialog
- Tap FAB → create new list modal

**Empty State:**
- Centered icon (shopping bag), "No lists yet" heading, subtitle prompting to tap the + button
- Animated entrance (fade + spring scale)

---

### 2. List Detail Screen

**Header:**
- Back arrow button (left) → returns to Home
- List name (center-left, bold, tappable to rename)
- Track / Edit mode selector dropdown (right) — emerald pill button showing current mode + chevron

**Progress Bar:**
- Thin emerald bar below the header showing overall completion
- "X/Y items complete" label with check-circle icon; turns emerald and shows "All done! 🎉" when complete

---

#### Track Mode

The default mode for using the list day-to-day.

**Typography:** Item names and quantities use **Comic Neue** (Comic Sans–style handwriting font, 20px for names, 16px for quantities). Malayalam characters are auto-detected and rendered in **Chilanka** instead.

**Item Rows:**
- Full-row tap target — tapping anywhere on the row (not just the checkbox) toggles completion
- Checkbox visual on the left (purely visual; outer tap handles the interaction)
- Item name + quantity below it
- 55% opacity when completed

**Check animation sequence (tapping to complete):**
1. Checkbox fills with emerald + scale spring bounce (immediate)
2. Animated strikethrough line draws across the text — `scaleX` 0→1 from center, 300ms cubic ease-out — both name and quantity get their own line
3. Row fades to 55% opacity (200ms)
4. Row height collapses to 0 (200ms cubic ease-in)
5. Item appears in the Completed section: fades in (0→55% opacity) + slides down from -10px, 320ms

**Uncheck animation sequence (tapping a completed item):**
1. Completed item fades out + slides up to -10px (200ms cubic ease-in), simultaneously
2. Row height collapses to 0 (200ms)
3. Item reappears in its original date group as a TrackItemRow: fades in from 0→1 opacity + slides up from +8px (250ms + spring)

**Date Groups:**
- Items are grouped by their creation date (Today, Yesterday, or formatted date)
- Groups ordered newest first
- Group header: horizontal line + emerald rounded pill showing date label + item count + collapse chevron
- Tap header to collapse/expand the group (opacity animation, 180ms)

**Completed Section:**
- Appears at the bottom of the track list, below all date groups
- Collapsed by default (first time the list is opened)
- Header: horizontal line + muted pill showing "Completed" + count + chevron
- Completed items sorted by completion time (most recent first)
- Items shown at 55% opacity with strikethrough text

---

#### Edit Mode

For managing the contents of a list.

**Item Rows:**
- Drag handle (≡) on the left — long-press to reorder within the date group
- Item name + quantity
- Edit icon (pencil) → transforms the row into inline text inputs with Save / Cancel buttons
- Delete icon (trash, red) → delete confirmation dialog

**Add Item Bar:**
- Sticky bar at the very bottom of the screen (always visible in Edit mode)
- Starts with a name input field; expands to show a quantity field on focus
- "Add" button appears once the name field has content
- Tapping Add creates the item at the top of today's date group

**Date Groups in Edit mode:**
- Same collapsible headers as Track mode
- Items within a group are individually draggable (DraggableFlatList per section)
- Other date groups remain non-draggable while dragging within one group

---

### 3. Settings Screen

Currently a stub/placeholder. Displays:
- Theme information
- Data storage note (local only)
- App version

Intended for future settings expansion.

---

## Modals & Dialogs

### Rename / Create Modal
- Appears for creating a new list (from FAB) and renaming an existing list (from card pencil or list name tap)
- TextInput auto-focused on open
- Confirm button labeled contextually ("Create" or "Rename")
- Cancel to dismiss

### Delete Confirmation Dialog
- Appears before deleting a list or an individual item
- Shows the name of what's being deleted
- Cancel + Delete (red) buttons

---

## Navigation Flow

```
Home Screen
  │
  ├── Tap FAB → Create List Modal
  │
  ├── Tap List Card → List Detail Screen
  │     ├── Track Mode (default)
  │     └── Edit Mode
  │
  └── Tap Settings → Settings Screen
```

---

## Animation Summary

| Animation | Trigger | Duration / Curve |
|---|---|---|
| Card entrance | List card mounts | Fade + translateY + scale, staggered 40ms/card |
| Checkbox fill | Item tapped | Spring scale bounce |
| Strikethrough draw | Item checked | scaleX 0→1, 300ms cubic ease-out |
| Row opacity fade | Item checked/unchecked | 200ms linear |
| Row height collapse | After strikethrough | 200ms cubic ease-in |
| Completed item entrance | Item added to completed | Fade 0→55% + slide from -10px, 320ms |
| Completed item exit | Item unchecked | Fade→0 + slide to -10px + height collapse, 200ms |
| TrackItemRow entrance | Component mounts | Fade 0→1 + slide from +8px, 250ms + spring |
| Date group collapse | Section header tapped | Opacity, 180ms |
| Empty state entrance | Empty screen shows | Fade + spring scale |

All animations run on the UI thread via react-native-reanimated worklets.

---

## Key UX Decisions

- **No swipe gestures** — all actions via explicit tap targets (target users prefer visible buttons)
- **Full-row tap** to toggle items (not just the checkbox)
- **Haptic feedback** on every item toggle (light impact)
- **Completed section collapsed by default** — keeps the active list clean
- **Completed items always move to bottom** — no toggle, always consistent behaviour
- **Comic Sans–style font** in Track mode — gives a handwritten shopping list feel
- **Drag handles visible at all times** in Edit mode (not hidden behind long-press on the row itself)
- **FAB at bottom center** — most accessible thumb zone for one-handed use
- **Delete always requires confirmation** — prevents accidental data loss
