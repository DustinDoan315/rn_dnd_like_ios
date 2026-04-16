import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import AutoDragSortableView from '../AutoDragSortableView/AutoDragSortableView';
import type { DnDLikeIOSProps } from './DnDLikeIOS.types';

const { width, height } = Dimensions.get('window');

export default function DnDLikeIOS<T = unknown>({
  data = [],
  setNewDataSource,
  Item,
  IconDelete,
  parentWidth = width,
  parentHeight = height,
  childrenWidth = 75,
  childrenHeight = 75,
  widthIconDelete = 15,
  heightIconDelete = 15,
  radiusIconDelete,
  degLeft = '-10deg',
  degRight = '10deg',
  timeoutShake = 20000,
  valueShakeLeft = 0.25,
  durationShakeLeft = 75,
  valueShakeRight = -0.25,
  durationShakeRight = 75,
  marginChildrenBottom = 10,
  marginChildrenRight = 10,
  marginChildrenLeft = 10,
  marginChildrenTop = 10,
  topIconDelete = 0,
  leftIconDelete = 0,
}: DnDLikeIOSProps<T>): React.ReactElement {
  // Ensure borderRadius is always a number (RN does not accept "50%" strings)
  const computedBorderRadius =
    typeof radiusIconDelete === 'number'
      ? radiusIconDelete
      : Math.floor(Math.min(widthIconDelete, heightIconDelete) / 2);

  const tiltAnimation = useRef(new Animated.Value(0)).current;
  const endAnimationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [endAnimation, setEndAnimation] = useState(false);
  const [dataShow, setDataShow] = useState<T[]>(data);
  const [childSPress, setChildSPress] = useState(false);
  const [childLPress, setChildLPress] = useState(false);

  // Notify parent when data changes
  useEffect(() => {
    setNewDataSource?.(dataShow);
  }, [dataShow, setNewDataSource]);

  const stopShakeAnimation = useCallback((): void => {
    setChildLPress(false);
    setChildSPress(false);
    setEndAnimation(false);
    tiltAnimation.stopAnimation();
    tiltAnimation.setValue(0);
  }, [tiltAnimation]);

  const startShakeAnimation = useCallback((): void => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnimation, {
          toValue: valueShakeLeft,
          duration: durationShakeLeft,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeRight,
          duration: durationShakeRight,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeLeft,
          duration: durationShakeLeft,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeRight,
          duration: durationShakeRight,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start(() => {
      tiltAnimation.setValue(0);
    });
  }, [
    tiltAnimation,
    valueShakeLeft,
    durationShakeLeft,
    valueShakeRight,
    durationShakeRight,
  ]);

  const handlerLongPress = useCallback((): void => {
    Vibration.vibrate();
    startShakeAnimation();
    setEndAnimation(true);
  }, [startShakeAnimation]);

  // Auto-stop shake after timeout
  useEffect(() => {
    if (endAnimation) {
      endAnimationTimeout.current = setTimeout(() => {
        stopShakeAnimation();
      }, timeoutShake);
    } else if (endAnimationTimeout.current != null) {
      clearTimeout(endAnimationTimeout.current);
    }
    return () => {
      if (endAnimationTimeout.current != null) {
        clearTimeout(endAnimationTimeout.current);
      }
    };
  }, [endAnimation, timeoutShake, stopShakeAnimation]);

  useEffect(() => {
    if (childLPress) handlerLongPress();
  }, [childLPress, handlerLongPress]);

  useEffect(() => {
    if (childSPress) stopShakeAnimation();
  }, [childSPress, stopShakeAnimation]);

  const handlerDeleteItem = useCallback(
    (index: number): void => {
      setDataShow((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
      if (endAnimationTimeout.current != null) {
        clearTimeout(endAnimationTimeout.current);
      }
      endAnimationTimeout.current = setTimeout(() => {
        stopShakeAnimation();
      }, 500);
    },
    [stopShakeAnimation],
  );

  const deleteButtonStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      backgroundColor: '#828282',
      zIndex: 9999,
      top: topIconDelete,
      left: leftIconDelete,
      width: widthIconDelete,
      height: heightIconDelete,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderRadius: computedBorderRadius,
    }),
    [
      topIconDelete,
      leftIconDelete,
      widthIconDelete,
      heightIconDelete,
      computedBorderRadius,
    ],
  );

  const renderIconDelete = useCallback(
    (_item: T, index: number): React.ReactElement => (
      <Pressable onPress={() => handlerDeleteItem(index)} style={deleteButtonStyle}>
        {IconDelete ?? <Text style={styles.deleteText}>─</Text>}
      </Pressable>
    ),
    [handlerDeleteItem, deleteButtonStyle, IconDelete],
  );

  const rotateInterpolation = useMemo(
    () =>
      tiltAnimation.interpolate({
        inputRange: [-1, 1],
        outputRange: [degLeft, degRight],
      }),
    [tiltAnimation, degLeft, degRight],
  );

  const renderItem = useCallback(
    (item: T, index: number): React.ReactElement => {
      if (!Item) {
        return <Text style={styles.fallback}>Hello</Text>;
      }
      return (
        <Animated.View
          style={{ transform: [{ rotate: rotateInterpolation }] }}>
          <View>
            {endAnimation && renderIconDelete(item, index)}
            {Item(item, index)}
          </View>
        </Animated.View>
      );
    },
    [Item, endAnimation, renderIconDelete, rotateInterpolation],
  );

  // Suppress unused variable warning — parentHeight is accepted for API
  // parity but the inner ScrollView manages its own height.
  void parentHeight;

  return (
    <AutoDragSortableView
      dataSource={dataShow}
      parentWidth={parentWidth}
      childrenWidth={childrenWidth}
      childrenHeight={childrenHeight}
      marginChildrenBottom={marginChildrenBottom}
      marginChildrenRight={marginChildrenRight}
      marginChildrenLeft={marginChildrenLeft}
      marginChildrenTop={marginChildrenTop}
      keyExtractor={(item: T, index: number) =>
        (item as Record<string, unknown>)?.item_id as string | number ?? index
      }
      renderItem={renderItem}
      setChildSPress={setChildSPress}
      setChildLPress={setChildLPress}
    />
  );
}

const styles = StyleSheet.create({
  deleteText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  fallback: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
