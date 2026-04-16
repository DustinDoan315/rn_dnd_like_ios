import type React from 'react';

export interface DnDLikeIOSProps<T = unknown> {
  /** Items to render in the grid. @default [] */
  data?: T[];
  /** Called whenever the data array changes (reorder or delete). */
  setNewDataSource?: (data: T[]) => void;
  /** Renders each grid item. */
  Item?: (item: T, index: number) => React.ReactNode;
  /** Custom element rendered inside the delete button. */
  IconDelete?: React.ReactNode;
  /** @default Dimensions.get('window').width */
  parentWidth?: number;
  /** @default Dimensions.get('window').height */
  parentHeight?: number;
  /** Width of each child item excluding margins. @default 75 */
  childrenWidth?: number;
  /** Height of each child item excluding margins. @default 75 */
  childrenHeight?: number;
  /** Width of the delete button in dp. @default 15 */
  widthIconDelete?: number;
  /** Height of the delete button in dp. @default 15 */
  heightIconDelete?: number;
  /**
   * Border radius of the delete button (number only — percentage strings are
   * not valid in React Native styles).
   * Defaults to a circle: Math.floor(min(widthIconDelete, heightIconDelete) / 2).
   */
  radiusIconDelete?: number;
  /** Rotation at the left peak of the shake animation. @default '-10deg' */
  degLeft?: string;
  /** Rotation at the right peak of the shake animation. @default '10deg' */
  degRight?: string;
  /** How long shake mode stays active before auto-stopping (ms). @default 20000 */
  timeoutShake?: number;
  /** Animated.Value target for the left tilt. @default 0.25 */
  valueShakeLeft?: number;
  /** Duration of the left-tilt step (ms). @default 75 */
  durationShakeLeft?: number;
  /** Animated.Value target for the right tilt. @default -0.25 */
  valueShakeRight?: number;
  /** Duration of the right-tilt step (ms). @default 75 */
  durationShakeRight?: number;
  /** @default 10 */
  marginChildrenBottom?: number;
  /** @default 10 */
  marginChildrenRight?: number;
  /** @default 10 */
  marginChildrenLeft?: number;
  /** @default 10 */
  marginChildrenTop?: number;
  /** Top offset of the delete button within the item. @default 0 */
  topIconDelete?: number;
  /** Left offset of the delete button within the item. @default 0 */
  leftIconDelete?: number;
}
