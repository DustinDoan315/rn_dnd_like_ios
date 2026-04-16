import type React from 'react';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import type { PanResponderGestureState } from 'react-native';

export type ScaleStatus = 'scale' | 'scaleX' | 'scaleY';

export interface AutoDragSortableViewProps<T = unknown> {
  /** Array of items to render in the sortable grid. */
  dataSource: T[];
  /**
   * Width of the parent container. Determines how many items fit per row.
   * @default Dimensions.get('window').width
   */
  parentWidth?: number;
  /** Height of each child item (excluding margins). */
  childrenHeight: number;
  /** Width of each child item (excluding margins). */
  childrenWidth: number;
  /** @default 0 */
  marginChildrenTop?: number;
  /** @default 0 */
  marginChildrenBottom?: number;
  /** @default 0 */
  marginChildrenLeft?: number;
  /** @default 0 */
  marginChildrenRight?: number;
  /**
   * Whether items can be dragged and reordered.
   * @default true
   */
  sortable?: boolean;
  /** Called when an item is tapped (not dragged). */
  onClickItem?: (allData: T[], item: T, index: number) => void;
  /** Called when a drag gesture begins. */
  onDragStart?: (startIndex: number) => void;
  /** Called when a drag gesture ends. */
  onDragEnd?: (startIndex: number, endIndex: number) => void;
  /** Called after items are reordered, with the updated data array. */
  onDataChange?: (data: T[]) => void;
  /** Renders each item in the grid. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /**
   * Which scale axis to animate on drag.
   * @default 'scale'
   */
  scaleStatus?: ScaleStatus;
  /**
   * Indices of items that cannot be dragged or displaced.
   * @default []
   */
  fixedItems?: number[];
  /** Returns a stable key for each item. Falls back to originIndex. */
  keyExtractor?: (item: T, index: number) => string | number;
  /**
   * Long-press delay in ms before drag begins.
   * @default 500
   */
  delayLongPress?: number;
  /**
   * Allow dragging beyond grid boundaries.
   * @default false
   */
  isDragFreely?: boolean;
  /** Called continuously while dragging. */
  onDragging?: (
    gestureState: PanResponderGestureState,
    left: number,
    top: number,
    moveToIndex: number,
  ) => void;
  /**
   * Scale multiplier applied to the dragged item.
   * @default 1.1
   */
  maxScale?: number;
  /**
   * Minimum opacity of non-dragged items during a drag.
   * @default 0.8
   */
  minOpacity?: number;
  /**
   * Duration of the scale animation on drag start/end (ms).
   * @default 100
   */
  scaleDuration?: number;
  /**
   * Duration of the slide animation when items reorder (ms).
   * @default 300
   */
  slideDuration?: number;
  /**
   * Pixels per auto-scroll tick when dragging near the edge.
   * @default 2
   */
  autoThrottle?: number;
  /**
   * Interval between auto-scroll ticks (ms).
   * @default 10
   */
  autoThrottleDuration?: number;
  /** Element rendered above the grid inside the ScrollView. */
  renderHeaderView?: React.ReactElement;
  /**
   * Height of the header view — required for accurate auto-scroll math.
   * @default 0
   */
  headerViewHeight?: number;
  /** Element rendered below the grid inside the ScrollView. */
  renderBottomView?: React.ReactElement;
  /** @default 0 */
  bottomViewHeight?: number;
  /** @default { top: 0, left: 0, bottom: 0, right: 1 } */
  scrollIndicatorInsets?: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
  };
  /** Forwarded from the inner ScrollView's onScroll event. */
  onScrollListener?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Provides access to the inner ScrollView ref. */
  onScrollRef?: (ref: ScrollView | null) => void;
  /** @internal Used by DnDLikeIOS to signal a long-press began. */
  setChildLPress: (value: boolean) => void;
  /** @internal Used by DnDLikeIOS to signal a press/drag release. */
  setChildSPress: (value: boolean) => void;
}
