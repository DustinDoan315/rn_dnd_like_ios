# react-native-dnd-like-ios

[![npm downloads](https://img.shields.io/npm/dm/react-native-dnd-like-ios.svg)](https://www.npmjs.com/package/react-native-dnd-like-ios)
[![npm version](https://img.shields.io/npm/v/react-native-dnd-like-ios.svg)](https://www.npmjs.com/package/react-native-dnd-like-ios)

Drag-and-drop sortable grid for React Native, mimicking the iOS home screen rearrange experience. Long-press any item to enter wiggle/edit mode, then drag to reorder. Written in **TypeScript** with full type declarations.

## Preview

![preview](https://github.com/HarryDoan/react-native-dnd-like-ios/assets/87471806/471e4857-a26c-4a5b-9550-ca2cb7d3cd6f)

---

## Table of Contents

- [Installation](#installation)
- [Android Setup](#android-setup)
- [Quickstart](#quickstart)
- [TypeScript Usage](#typescript-usage)
- [Props — DnDLikeIOS](#props--dndlikeios)
- [Props — AutoDragSortableView](#props--autodragsortableview)
- [Advanced: AutoDragSortableView](#advanced-autodragsortableview)
- [Migrating from v1](#migrating-from-v1)
- [Contributing](#contributing)

---

## Installation

```bash
npm install react-native-dnd-like-ios
# or
yarn add react-native-dnd-like-ios
```

**Peer dependencies** (already in your RN project):

```bash
react >= 18.0.0
react-native >= 0.71.0
```

---

## Android Setup

Add the `VIBRATE` permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.VIBRATE"/>
```

---

## Quickstart

```jsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import DnDLikeIOS from 'react-native-dnd-like-ios';

const { width } = Dimensions.get('window');

const ITEMS = [
  { id: '1', name: 'App 1' },
  { id: '2', name: 'App 2' },
  { id: '3', name: 'App 3' },
  { id: '4', name: 'App 4' },
  { id: '5', name: 'App 5' },
  { id: '6', name: 'App 6' },
];

const renderItem = (item, index) => (
  <View style={styles.item}>
    <Text style={styles.label}>{item.name}</Text>
  </View>
);

export default function App() {
  const [data, setData] = useState(ITEMS);

  return (
    <View style={styles.container}>
      <DnDLikeIOS
        data={data}
        parentWidth={width}
        childrenWidth={80}
        childrenHeight={80}
        Item={renderItem}
        setNewDataSource={setData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9CD7CB' },
  item: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { color: '#fff', fontWeight: 'bold' },
});
```

---

## TypeScript Usage

```tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import DnDLikeIOS from 'react-native-dnd-like-ios';
import type { DnDLikeIOSProps } from 'react-native-dnd-like-ios';

const { width } = Dimensions.get('window');

interface AppItem {
  id: string;
  name: string;
}

const ITEMS: AppItem[] = [
  { id: '1', name: 'App 1' },
  { id: '2', name: 'App 2' },
  { id: '3', name: 'App 3' },
];

// renderItem is fully typed — item is AppItem, index is number
const renderItem = (item: AppItem, index: number) => (
  <View style={styles.item}>
    <Text>{item.name}</Text>
  </View>
);

// Custom delete icon
const deleteIcon = <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>;

export default function App() {
  const [data, setData] = useState<AppItem[]>(ITEMS);

  return (
    <View style={styles.container}>
      <DnDLikeIOS<AppItem>
        data={data}
        parentWidth={width}
        childrenWidth={80}
        childrenHeight={80}
        marginChildrenTop={8}
        marginChildrenBottom={8}
        marginChildrenLeft={8}
        marginChildrenRight={8}
        Item={renderItem}
        IconDelete={deleteIcon}
        widthIconDelete={18}
        heightIconDelete={18}
        setNewDataSource={setData}
        timeoutShake={15000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  item: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## Props — DnDLikeIOS

The default export. Handles long-press shake animation, delete mode, and wraps `AutoDragSortableView`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | `[]` | Items to render in the grid. |
| `setNewDataSource` | `(data: T[]) => void` | — | Called on every reorder or delete with the updated array. |
| `Item` | `(item: T, index: number) => ReactNode` | — | Renders each grid item. |
| `IconDelete` | `ReactNode` | `─` (dash) | Element shown inside the delete button during shake mode. |
| `parentWidth` | `number` | `window.width` | Width of the grid container. Controls how many items fit per row. |
| `parentHeight` | `number` | `window.height` | Height of the grid container. |
| `childrenWidth` | `number` | `75` | Width of each item, excluding margins. |
| `childrenHeight` | `number` | `75` | Height of each item, excluding margins. |
| `marginChildrenTop` | `number` | `10` | Top margin of each item. |
| `marginChildrenBottom` | `number` | `10` | Bottom margin of each item. |
| `marginChildrenLeft` | `number` | `10` | Left margin of each item. |
| `marginChildrenRight` | `number` | `10` | Right margin of each item. |
| `widthIconDelete` | `number` | `15` | Width of the delete button (dp). |
| `heightIconDelete` | `number` | `15` | Height of the delete button (dp). |
| `radiusIconDelete` | `number` | circle | `borderRadius` of the delete button. Defaults to a perfect circle. Must be a **number** — percentage strings are not supported in React Native. |
| `topIconDelete` | `number` | `0` | Top offset of the delete button within the item. |
| `leftIconDelete` | `number` | `0` | Left offset of the delete button within the item. |
| `degLeft` | `string` | `'-10deg'` | Rotation at the left peak of the shake animation. |
| `degRight` | `string` | `'10deg'` | Rotation at the right peak of the shake animation. |
| `timeoutShake` | `number` | `20000` | Ms before shake mode auto-stops. |
| `valueShakeLeft` | `number` | `0.25` | Animated value target for the left tilt. |
| `durationShakeLeft` | `number` | `75` | Duration of the left-tilt step (ms). |
| `valueShakeRight` | `number` | `-0.25` | Animated value target for the right tilt. |
| `durationShakeRight` | `number` | `75` | Duration of the right-tilt step (ms). |

---

## Props — AutoDragSortableView

The lower-level engine component, exported as a named export. Use this directly when you need full control over the drag behaviour without the shake/delete overlay.

```tsx
import { AutoDragSortableView } from 'react-native-dnd-like-ios';
import type { AutoDragSortableViewProps } from 'react-native-dnd-like-ios';
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSource` | `T[]` | **required** | Array of items to render. |
| `renderItem` | `(item: T, index: number) => ReactNode` | **required** | Renders each item. |
| `childrenWidth` | `number` | **required** | Item width excluding margins. |
| `childrenHeight` | `number` | **required** | Item height excluding margins. |
| `parentWidth` | `number` | `window.width` | Container width — determines columns per row. |
| `marginChildrenTop` | `number` | `0` | |
| `marginChildrenBottom` | `number` | `0` | |
| `marginChildrenLeft` | `number` | `0` | |
| `marginChildrenRight` | `number` | `0` | |
| `sortable` | `boolean` | `true` | Set to `false` to disable drag reordering. |
| `fixedItems` | `number[]` | `[]` | Indices of items that cannot be moved or displaced. |
| `keyExtractor` | `(item: T, index: number) => string \| number` | `originIndex` | Stable key per item. |
| `delayLongPress` | `number` | `500` | Long-press delay in ms before drag begins. |
| `isDragFreely` | `boolean` | `false` | Allow dragging outside grid boundaries. |
| `maxScale` | `number` | `1.1` | Scale of the item while being dragged. |
| `minOpacity` | `number` | `0.8` | Opacity of non-dragged items during a drag. |
| `scaleDuration` | `number` | `100` | Duration of the pick-up/drop scale animation (ms). |
| `slideDuration` | `number` | `300` | Duration of the reorder slide animation (ms). |
| `scaleStatus` | `'scale' \| 'scaleX' \| 'scaleY'` | `'scale'` | Which scale axis animates on drag. |
| `autoThrottle` | `number` | `2` | Pixels per auto-scroll tick when dragging near the edge. |
| `autoThrottleDuration` | `number` | `10` | Interval between auto-scroll ticks (ms). |
| `headerViewHeight` | `number` | `0` | Height of a header rendered above the grid; required for accurate auto-scroll math. |
| `bottomViewHeight` | `number` | `0` | Height of a footer rendered below the grid. |
| `renderHeaderView` | `ReactElement` | — | Element rendered above the grid inside the ScrollView. |
| `renderBottomView` | `ReactElement` | — | Element rendered below the grid inside the ScrollView. |
| `scrollIndicatorInsets` | `{ top?, left?, bottom?, right? }` | `{ right: 1 }` | Passed to the inner `ScrollView`. |
| `onClickItem` | `(allData: T[], item: T, index: number) => void` | — | Fired on a short tap (not a drag). |
| `onDragStart` | `(index: number) => void` | — | Fired when a drag begins. |
| `onDragEnd` | `(startIndex: number, endIndex: number) => void` | — | Fired when a drag ends. |
| `onDragging` | `(gestureState, left, top, moveToIndex) => void` | — | Fires continuously during a drag. |
| `onDataChange` | `(data: T[]) => void` | — | Fired after items are reordered with the new array. |
| `onScrollListener` | `(event) => void` | — | Forwarded from the inner ScrollView's `onScroll`. |
| `onScrollRef` | `(ref) => void` | — | Provides access to the inner `ScrollView` ref. |

---

## Advanced: AutoDragSortableView

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AutoDragSortableView } from 'react-native-dnd-like-ios';

interface Item {
  id: string;
  label: string;
}

const DATA: Item[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  label: `Item ${i + 1}`,
}));

export default function Grid() {
  const [items, setItems] = useState<Item[]>(DATA);

  return (
    <AutoDragSortableView<Item>
      dataSource={items}
      parentWidth={360}
      childrenWidth={80}
      childrenHeight={80}
      marginChildrenTop={6}
      marginChildrenBottom={6}
      marginChildrenLeft={6}
      marginChildrenRight={6}
      keyExtractor={(item) => item.id}
      sortable={true}
      fixedItems={[0]}
      onDataChange={setItems}
      onDragStart={(i) => console.log('drag start', i)}
      onDragEnd={(from, to) => console.log('drag end', from, '→', to)}
      renderItem={(item) => (
        <View style={{ width: 75, height: 75, backgroundColor: '#ddd', borderRadius: 8,
          justifyContent: 'center', alignItems: 'center' }}>
          <Text>{item.label}</Text>
        </View>
      )}
      setChildLPress={() => {}}
      setChildSPress={() => {}}
    />
  );
}
```

---

## Migrating from v1

| v1 prop | v2 equivalent | Notes |
|---|---|---|
| `radiusIconDelete="50%"` | `radiusIconDelete={8}` | Must be a number. The default is now a computed circle. |
| `import AutoDragSort from '...'` | `import { AutoDragSortableView } from '...'` | Filename and export name now match the class name. |
| `"react": "18.2.0"` peer dep | `"react": ">=18.0.0"` | Semver range — works with React 18 and 19. |
| `"react-native": "0.71.10"` peer dep | `"react-native": ">=0.71.0"` | Works with RN 0.71 through latest. |

**No other breaking changes.** All v1 props are supported with the same names.

---

## Troubleshooting

**Items don't reorder on Android**
Make sure you have not set `sortable={false}`. Also confirm the `VIBRATE` permission is in your manifest.

**Delete button is not circular**
`radiusIconDelete` must be a **number** (e.g. `8`), not a string like `"50%"`. The default automatically computes a circle from `widthIconDelete` and `heightIconDelete`.

**Grid height looks wrong**
Ensure `parentWidth` matches the actual rendered width of the container, not the screen width if the container has horizontal padding.

**Auto-scroll doesn't trigger**
`autoThrottle` and `autoThrottleDuration` only activate when the grid content is taller than the scroll window. Make sure `headerViewHeight` is set if you have a header above the grid.

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

```bash
# Install deps
npm install

# Type-check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```
