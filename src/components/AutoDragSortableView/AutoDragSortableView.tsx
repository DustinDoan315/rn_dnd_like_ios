import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AutoDragSortableViewProps, ScaleStatus } from './AutoDragSortableView.types';

const { width } = Dimensions.get('window');

const DEFAULT_Z_INDEX = 9;
const TOUCH_Z_INDEX = 99;

// ── Internal types ────────────────────────────────────────────────────────────

interface SortableItem<T> {
  data: T;
  originIndex: number;
  originLeft: number;
  originTop: number;
  position: Animated.ValueXY;
  scaleValue: Animated.Value;
}

interface State<T> {
  dataSource: SortableItem<T>[];
  curPropsDataSource: T[];
  height: number;
  itemWidth: number;
  itemHeight: number;
  heightScrollView: number;
  scrollEnabled: boolean;
  activeDragIndex: number | null;
}

interface TouchCurItem {
  ref: View | null;
  index: number;
  originLeft: number;
  originTop: number;
  moveToIndex: number;
}

interface AutoScrollObj {
  curDy: number;
  scrollDx: number;
  scrollDy: number;
  hasScrollDy: number | null;
  forceScrollStatus: -2 | -1 | 0 | 1 | 2;
}

interface ScrollData {
  totalHeight: number;
  windowHeight: number;
  offsetY: number;
  hasScroll: boolean;
}

type GestureInput = Pick<PanResponderGestureState, 'dx' | 'dy'> & {
  vy?: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcItemSize(props: AutoDragSortableViewProps): {
  itemWidth: number;
  itemHeight: number;
} {
  return {
    itemWidth:
      props.childrenWidth +
      (props.marginChildrenLeft ?? 0) +
      (props.marginChildrenRight ?? 0),
    itemHeight:
      props.childrenHeight +
      (props.marginChildrenTop ?? 0) +
      (props.marginChildrenBottom ?? 0),
  };
}

function buildDataSource<T>(
  items: T[],
  rowNum: number,
  itemWidth: number,
  itemHeight: number,
): SortableItem<T>[] {
  return items.map((item, index) => {
    const originLeft = (index % rowNum) * itemWidth;
    const originTop = Math.floor(index / rowNum) * itemHeight;
    return {
      data: item,
      originIndex: index,
      originLeft,
      originTop,
      position: new Animated.ValueXY({
        x: Math.round(originLeft),
        y: Math.round(originTop),
      }),
      scaleValue: new Animated.Value(1),
    };
  });
}

function buildTransform(
  scaleValue: Animated.Value,
  scaleStatus: ScaleStatus,
): object[] {
  switch (scaleStatus) {
    case 'scaleX':
      return [{ scaleX: scaleValue }];
    case 'scaleY':
      return [{ scaleY: scaleValue }];
    default:
      return [{ scale: scaleValue }];
  }
}

// ── Default props ─────────────────────────────────────────────────────────────

const DEFAULTS = {
  marginChildrenTop: 0,
  marginChildrenBottom: 0,
  marginChildrenLeft: 0,
  marginChildrenRight: 0,
  parentWidth: width,
  sortable: true,
  scaleStatus: 'scale' as ScaleStatus,
  fixedItems: [] as number[],
  isDragFreely: false,
  maxScale: 1.1,
  minOpacity: 0.8,
  scaleDuration: 100,
  slideDuration: 300,
  autoThrottle: 2,
  autoThrottleDuration: 10,
  scrollIndicatorInsets: { top: 0, left: 0, bottom: 0, right: 1 },
  headerViewHeight: 0,
  bottomViewHeight: 0,
  delayLongPress: 500,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default class AutoDragSortableView<T = unknown> extends Component<
  AutoDragSortableViewProps<T>,
  State<T>
> {
  static defaultProps = DEFAULTS;

  private sortRefs = new Map<string | number, View | null>();
  private displacedItems = new Set<number>();
  private touchCurItem: TouchCurItem | null = null;
  private isMovePanResponder = false;
  private isHasMove = false;
  private isHasMeasure = false;
  private isScaleRecovery: ReturnType<typeof setTimeout> | null = null;
  private autoInterval: ReturnType<typeof setInterval> | null = null;
  private autoObj!: AutoScrollObj;
  private curScrollData: ScrollData | null = null;
  private scrollRef: ScrollView | null = null;
  private _panResponder: PanResponderInstance;

  constructor(props: AutoDragSortableViewProps<T>) {
    super(props);

    const { itemWidth, itemHeight } = calcItemSize(props);
    const parentWidth = props.parentWidth ?? DEFAULTS.parentWidth;
    const rowNum = Math.floor(parentWidth / itemWidth);
    const dataSource = buildDataSource(
      props.dataSource,
      rowNum,
      itemWidth,
      itemHeight,
    );

    this.state = {
      dataSource,
      curPropsDataSource: props.dataSource,
      height: Math.ceil(dataSource.length / rowNum) * itemHeight,
      itemWidth,
      itemHeight,
      heightScrollView:
        ((dataSource.length + 1) * itemHeight) / (parentWidth / itemWidth - 1),
      scrollEnabled: true,
      activeDragIndex: null,
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => {
        this.isMovePanResponder = false;
        return false;
      },
      onMoveShouldSetPanResponder: () => this.isMovePanResponder,
      onMoveShouldSetPanResponderCapture: () => this.isMovePanResponder,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_evt, gestureState) =>
        this.moveTouch(_evt, gestureState),
      onPanResponderRelease: (evt) => {
        this.endTouch(evt);
        setTimeout(() => {
          this.props.setChildSPress(true);
        }, 500);
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    });
  }

  static getDerivedStateFromProps<T>(
    nextProps: AutoDragSortableViewProps<T>,
    prevState: State<T>,
  ): Partial<State<T>> | null {
    const { itemWidth, itemHeight } = calcItemSize(nextProps);
    if (
      nextProps.dataSource !== prevState.curPropsDataSource ||
      itemWidth !== prevState.itemWidth ||
      itemHeight !== prevState.itemHeight
    ) {
      const parentWidth = nextProps.parentWidth ?? width;
      const rowNum = Math.floor(parentWidth / itemWidth);
      const dataSource = buildDataSource(
        nextProps.dataSource,
        rowNum,
        itemWidth,
        itemHeight,
      );
      return {
        dataSource,
        curPropsDataSource: nextProps.dataSource,
        height: Math.ceil(dataSource.length / rowNum) * itemHeight,
        itemWidth,
        itemHeight,
      };
    }
    return null;
  }

  componentDidMount(): void {
    this.initTag();
    this.autoMeasureHeight();
  }

  componentDidUpdate(): void {
    this.autoMeasureHeight();
  }

  componentWillUnmount(): void {
    if (this.isScaleRecovery != null) clearTimeout(this.isScaleRecovery);
    this.clearAutoInterval();
  }

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  private autoMeasureHeight = (): void => {
    if (!this.isHasMeasure) {
      setTimeout(() => {
        this.scrollTo(1, false);
        this.scrollTo(0, false);
      }, 30);
    }
  };

  private initTag = (): void => {
    this.clearAutoInterval();
    this.displacedItems.clear();
    this.autoObj = {
      curDy: 0,
      scrollDx: 0,
      scrollDy: 0,
      hasScrollDy: null,
      forceScrollStatus: 0,
    };
  };

  private dealtScrollStatus = (): void => {
    const scrollData = this.curScrollData;
    if (scrollData == null) return;
    const { totalHeight, windowHeight, offsetY } = scrollData;
    if (totalHeight <= windowHeight + offsetY) {
      this.autoObj.forceScrollStatus = -2;
    } else if (offsetY <= 0) {
      this.autoObj.forceScrollStatus = 2;
    }
  };

  private clearAutoInterval = (): void => {
    if (this.autoInterval != null) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  };

  private startAutoScroll = (): void => {
    if (this.autoInterval != null) return;

    const throttle =
      this.props.autoThrottle ?? DEFAULTS.autoThrottle;
    const throttleDuration =
      this.props.autoThrottleDuration ?? DEFAULTS.autoThrottleDuration;

    this.autoInterval = setInterval(() => {
      const status = this.autoObj.forceScrollStatus;
      if (status === 0 || status === 2 || status === -2) {
        this.clearAutoInterval();
        return;
      }
      if (!this.curScrollData?.hasScroll) return;

      if (status === 1) {
        this.autoObj.scrollDy += throttle;
      } else if (status === -1) {
        this.autoObj.scrollDy -= throttle;
      }

      this.scrollTo(this.autoObj.scrollDy, false);
      this.dealtScrollStatus();

      const syntheticGesture: GestureInput = {
        dx: this.autoObj.scrollDx,
        dy: this.autoObj.curDy + this.autoObj.scrollDy,
      };
      if (Platform.OS === 'android') {
        setTimeout(() => {
          if (this.isHasMove) this.moveTouch(null, syntheticGesture);
        }, 1);
      } else {
        this.moveTouch(null, syntheticGesture);
      }
    }, throttleDuration);
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────

  startTouch(touchIndex: number): void {
    const fixedItems = this.props.fixedItems ?? DEFAULTS.fixedItems;
    if (fixedItems.length > 0 && fixedItems.includes(touchIndex)) return;

    this.isHasMove = false;
    this.isHasMeasure = true;

    if (!(this.props.sortable ?? DEFAULTS.sortable)) return;

    const key = this._getKey(touchIndex);
    if (!this.sortRefs.has(key)) return;

    if (this.isStartupAuto()) {
      this.autoObj.scrollDy = this.autoObj.hasScrollDy =
        this.curScrollData!.offsetY;
    }

    this.setState({ scrollEnabled: false });
    this.props.onDragStart?.(touchIndex);

    Animated.timing(this.state.dataSource[touchIndex].scaleValue, {
      toValue: this.props.maxScale ?? DEFAULTS.maxScale,
      duration: this.props.scaleDuration ?? DEFAULTS.scaleDuration,
      useNativeDriver: false,
    }).start(() => {
      this.touchCurItem = {
        ref: this.sortRefs.get(key) ?? null,
        index: touchIndex,
        originLeft: this.state.dataSource[touchIndex].originLeft,
        originTop: this.state.dataSource[touchIndex].originTop,
        moveToIndex: touchIndex,
      };
      this.setState({ activeDragIndex: touchIndex });
      this.isMovePanResponder = true;
    });
  }

  private moveTouch(_nativeEvent: unknown, gestureState: GestureInput): void {
    this.isHasMove = true;
    if (!this.touchCurItem) return;

    let { dx, dy } = gestureState;
    const vy = gestureState.vy;
    const { itemWidth, itemHeight, dataSource } = this.state;
    const parentWidth = this.props.parentWidth ?? DEFAULTS.parentWidth;
    const rowNum = Math.floor(parentWidth / itemWidth);
    const maxWidth = parentWidth - itemWidth;
    const maxHeight =
      itemHeight * Math.ceil(dataSource.length / rowNum) - itemHeight;

    if (!(this.props.isDragFreely ?? DEFAULTS.isDragFreely)) {
      if (this.touchCurItem.originLeft + dx < 0) {
        dx = -this.touchCurItem.originLeft;
      } else if (this.touchCurItem.originLeft + dx > maxWidth) {
        dx = maxWidth - this.touchCurItem.originLeft;
      }
      if (!this.isStartupAuto()) {
        if (this.touchCurItem.originTop + dy < 0) {
          dy = -this.touchCurItem.originTop;
        } else if (this.touchCurItem.originTop + dy > maxHeight) {
          dy = maxHeight - this.touchCurItem.originTop;
        }
      }
    }

    if (this.isStartupAuto()) {
      const childrenHeight = this.props.childrenHeight;
      const maxScale = this.props.maxScale ?? DEFAULTS.maxScale;
      const marginTop =
        this.props.marginChildrenTop ?? DEFAULTS.marginChildrenTop;
      const headerHeight =
        this.props.headerViewHeight ?? DEFAULTS.headerViewHeight;
      const curDis =
        this.touchCurItem.originTop + dy - (this.autoObj.hasScrollDy ?? 0);

      if (_nativeEvent != null && vy != null) {
        const tempStatus = this.autoObj.forceScrollStatus;
        const minDownDiss =
          curDis +
          childrenHeight * (1 + (maxScale - 1) / 2) +
          marginTop +
          headerHeight;
        const maxUpDiss = curDis + marginTop + headerHeight;

        if (
          (tempStatus === 0 || tempStatus === 2) &&
          vy > 0.01 &&
          minDownDiss > (this.curScrollData?.windowHeight ?? 0)
        ) {
          this.autoObj.curDy = dy;
          this.autoObj.forceScrollStatus = 1;
          this.startAutoScroll();
        } else if (
          (tempStatus === 0 || tempStatus === -2) &&
          -vy > 0.01 &&
          maxUpDiss < 0
        ) {
          this.autoObj.curDy = dy;
          this.autoObj.forceScrollStatus = -1;
          this.startAutoScroll();
        }
      }

      if (vy != null) {
        if (this.autoObj.forceScrollStatus >= 1 && -vy > 0.01) {
          this.autoObj.forceScrollStatus = 0;
        } else if (this.autoObj.forceScrollStatus <= -1 && vy > 0.01) {
          this.autoObj.forceScrollStatus = 0;
        }
      }

      this.autoObj.scrollDx = dx;
      dy = dy - (this.autoObj.hasScrollDy ?? 0);

      if (_nativeEvent != null) {
        dy = dy + this.autoObj.scrollDy;
        if (
          this.autoObj.forceScrollStatus === 1 ||
          this.autoObj.forceScrollStatus === -1
        ) {
          return;
        }
      }
    }

    const left = this.touchCurItem.originLeft + dx;
    const top = this.touchCurItem.originTop + dy;

    dataSource[this.touchCurItem.index].position.setValue({ x: left, y: top });

    const moveXNum = dx > 0
      ? Math.round(dx / itemWidth)
      : dx < 0
      ? Math.round(dx / itemWidth)
      : 0;
    const moveYNum = dy > 0
      ? Math.round(dy / itemHeight)
      : dy < 0
      ? Math.round(dy / itemHeight)
      : 0;

    const moveToIndex = Math.max(
      0,
      Math.min(
        dataSource.length - 1,
        this.touchCurItem.index + moveXNum + moveYNum * rowNum,
      ),
    );

    if (this.props.onDragging) {
      this.props.onDragging(
        gestureState as PanResponderGestureState,
        left,
        top,
        moveToIndex,
      );
    }

    if (this.touchCurItem.moveToIndex !== moveToIndex) {
      const fixedItems = this.props.fixedItems ?? DEFAULTS.fixedItems;
      if (fixedItems.length > 0 && fixedItems.includes(moveToIndex)) return;
      this.touchCurItem.moveToIndex = moveToIndex;

      const slideDuration =
        this.props.slideDuration ?? DEFAULTS.slideDuration;
      const touchIndex = this.touchCurItem.index;

      dataSource.forEach((item, index) => {
        let nextItem: SortableItem<T> | null = null;

        if (index > touchIndex && index <= moveToIndex) {
          nextItem = dataSource[index - 1];
        } else if (index >= moveToIndex && index < touchIndex) {
          nextItem = dataSource[index + 1];
        } else if (index !== touchIndex && this.displacedItems.has(index)) {
          nextItem = dataSource[index];
        } else if (
          (touchIndex - moveToIndex > 0 && moveToIndex === index + 1) ||
          (touchIndex - moveToIndex < 0 && moveToIndex === index - 1)
        ) {
          nextItem = dataSource[index];
        }

        if (nextItem != null) {
          if (nextItem === dataSource[index]) {
            this.displacedItems.delete(index);
          } else {
            this.displacedItems.add(index);
          }
          Animated.timing(item.position, {
            toValue: {
              x: Math.round(nextItem.originLeft),
              y: Math.round(nextItem.originTop),
            },
            duration: slideDuration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }).start();
        }
      });
    }
  }

  private endTouch(_nativeEvent: unknown): void {
    this.isHasMove = false;
    this.initTag();

    if (!this.touchCurItem) return;

    this.setState({ scrollEnabled: true });
    this.props.onDragEnd?.(
      this.touchCurItem.index,
      this.touchCurItem.moveToIndex,
    );

    Animated.timing(
      this.state.dataSource[this.touchCurItem.index].scaleValue,
      {
        toValue: 1,
        duration: this.props.scaleDuration ?? DEFAULTS.scaleDuration,
        useNativeDriver: false,
      },
    ).start(() => {
      if (this.touchCurItem) {
        this.setState({ activeDragIndex: null });
        this.changePosition(
          this.touchCurItem.index,
          this.touchCurItem.moveToIndex,
        );
        this.touchCurItem = null;
      }
    });
  }

  private onPressOut = (): void => {
    this.isScaleRecovery = setTimeout(() => {
      if (this.isMovePanResponder && !this.isHasMove) {
        this.endTouch(null);
      }
    }, 220);
  };

  private changePosition(startIndex: number, endIndex: number): void {
    if (startIndex === endIndex) {
      const curItem = this.state.dataSource[startIndex];
      curItem?.position.setValue({
        x: Math.round(curItem.originLeft),
        y: Math.round(curItem.originTop),
      });
      return;
    }

    let lo = startIndex;
    let hi = endIndex;
    let isCommon = true;

    if (lo > hi) {
      isCommon = false;
      [lo, hi] = [hi, lo];
    }

    const newDataSource = [...this.state.dataSource].map((item, index) => {
      let newIndex: number | null = null;

      if (isCommon) {
        if (hi > index && index >= lo) newIndex = index + 1;
        else if (hi === index) newIndex = lo;
      } else {
        if (hi >= index && index > lo) newIndex = index - 1;
        else if (lo === index) newIndex = hi;
      }

      if (newIndex != null) {
        const src = this.state.dataSource[newIndex];
        return {
          ...src,
          originLeft: item.originLeft,
          originTop: item.originTop,
          position: new Animated.ValueXY({
            x: Math.round(item.originLeft),
            y: Math.round(item.originTop),
          }),
        };
      }
      return item;
    });

    this.setState({ dataSource: newDataSource }, () => {
      this.displacedItems.clear();
      this.props.onDataChange?.(this.getOriginalData());

      const loItem = this.state.dataSource[lo];
      loItem?.position.setValue({
        x: Math.round(loItem.originLeft),
        y: Math.round(loItem.originTop),
      });

      const hiItem = this.state.dataSource[hi];
      hiItem?.position.setValue({
        x: Math.round(hiItem.originLeft),
        y: Math.round(hiItem.originTop),
      });
    });
  }

  private getOriginalData(): T[] {
    return this.state.dataSource.map((item) => item.data);
  }

  private isStartupAuto = (): boolean => this.curScrollData != null;

  private scrollTo = (y: number, animated = true): void => {
    if (this.curScrollData) {
      if (
        this.autoObj.forceScrollStatus < 0 &&
        this.curScrollData.offsetY <= 0
      ) {
        this.autoObj.scrollDy = 0;
        return;
      }
      if (
        this.autoObj.forceScrollStatus > 0 &&
        this.curScrollData.windowHeight + this.curScrollData.offsetY >=
          this.curScrollData.totalHeight
      ) {
        this.autoObj.scrollDy = this.curScrollData.offsetY;
        return;
      }
      this.curScrollData.hasScroll = false;
    }
    this.scrollRef?.scrollTo({ x: 0, y, animated });
  };

  private onScrollListener = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const { nativeEvent } = event;
    this.curScrollData = {
      totalHeight: nativeEvent.contentSize.height,
      windowHeight: nativeEvent.layoutMeasurement.height,
      offsetY: nativeEvent.contentOffset.y,
      hasScroll: true,
    };
    if (nativeEvent.contentOffset.y !== 0) this.isHasMeasure = true;
    this.props.onScrollListener?.(event);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  private _getKey = (index: number): string | number => {
    const item = this.state.dataSource[index];
    return this.props.keyExtractor
      ? this.props.keyExtractor(item.data, index)
      : item.originIndex;
  };

  private _renderItemView = (): React.ReactNode[] => {
    const maxScale = this.props.maxScale ?? DEFAULTS.maxScale;
    const minOpacity = this.props.minOpacity ?? DEFAULTS.minOpacity;
    const scaleStatus = this.props.scaleStatus ?? DEFAULTS.scaleStatus;
    const delayLongPress =
      this.props.delayLongPress ?? DEFAULTS.delayLongPress;

    const inputRange = maxScale >= 1 ? [1, maxScale] : [maxScale, 1];
    const outputRange = maxScale >= 1 ? [1, minOpacity] : [minOpacity, 1];

    return this.state.dataSource.map((item, index) => {
      const key = this._getKey(index);
      return (
        <Animated.View
          key={key}
          ref={(ref) => this.sortRefs.set(key, ref as View | null)}
          {...this._panResponder.panHandlers}
          style={[
            styles.item,
            {
              marginTop: this.props.marginChildrenTop ?? 0,
              marginBottom: this.props.marginChildrenBottom ?? 0,
              marginLeft: this.props.marginChildrenLeft ?? 0,
              marginRight: this.props.marginChildrenRight ?? 0,
              left: item.position.x,
              top: item.position.y,
              opacity: item.scaleValue.interpolate({ inputRange, outputRange }),
              transform: buildTransform(item.scaleValue, scaleStatus),
              zIndex:
                index === this.state.activeDragIndex
                  ? TOUCH_Z_INDEX
                  : DEFAULT_Z_INDEX,
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            delayLongPress={delayLongPress}
            onPressOut={this.onPressOut}
            onLongPress={() => {
              this.startTouch(index);
              this.props.setChildLPress(true);
            }}
            onPress={() => {
              if (this.props.onClickItem) {
                this.isHasMeasure = true;
                this.props.onClickItem(
                  this.getOriginalData(),
                  item.data,
                  index,
                );
              }
              this.props.setChildSPress(true);
            }}>
            {this.props.renderItem(item.data, index)}
          </TouchableOpacity>
        </Animated.View>
      );
    });
  };

  render(): React.ReactNode {
    const scrollIndicatorInsets =
      this.props.scrollIndicatorInsets ?? DEFAULTS.scrollIndicatorInsets;
    const parentWidth = this.props.parentWidth ?? DEFAULTS.parentWidth;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={1}
        scrollIndicatorInsets={scrollIndicatorInsets}
        ref={(ref) => {
          this.props.onScrollRef?.(ref);
          this.scrollRef = ref;
        }}
        scrollEnabled={this.state.scrollEnabled}
        onScroll={this.onScrollListener}
        style={styles.container}>
        <View
          style={[
            styles.swipe,
            {
              width: parentWidth,
              height: this.state.heightScrollView,
            },
          ]}>
          <View>{this._renderItemView()}</View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swipe: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  item: {
    position: 'absolute',
  },
});
