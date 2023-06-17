import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Vibration,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import AutoDragSort from "./AutoDragSort";
const { width, height } = Dimensions.get("window");

const DnDLikeIOS = ({
  IconDelete,
  data = [],
  valueShakeLeft = 0.25,
  durationShakeLeft = 75,
  valueShakeRight = -0.25,
  durationShakeRight = 75,
  degLeft = "-10deg",
  degRight = "10deg",
  sizeItemBtnDelete = 16,
  timeoutShake = 20000,
  Item,
  parentWidth = width,
  parentHeight = height,
  childrenWidth = 75,
  childrenHeight = 75,
  marginChildrenBottom = 10,
  marginChildrenRight = 10,
  marginChildrenLeft = 10,
  marginChildrenTop = 10,
}) => {
  const tiltAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const endAnimationTimeout = useRef(null);
  const [endAnimation, setEndAnimation] = useState(false);
  const [dataShow, setDataShow] = useState(data);
  const [childSPress, setChildSPress] = useState(false);
  const [childLPress, setChildLPress] = useState(false);

  useEffect(() => {
    if (endAnimation) {
      endAnimationTimeout.current = setTimeout(() => {
        stopShakeAnimation();
        setChildLPress(false);
        setChildSPress(false);
      }, timeoutShake);
    } else {
      clearTimeout(endAnimationTimeout.current);
    }

    return () => {
      clearTimeout(endAnimationTimeout.current);
    };
  }, [endAnimation]);

  useEffect(() => {
    if (childLPress) {
      handlerLongPress();
    }
  }, [childLPress]);
  useEffect(() => {
    if (childSPress) {
      stopShakeAnimation();
    }
  }, [childSPress]);

  const _renderItem = (item, index) => {
    return Item ? (
      <Animated.View
        key={index}
        style={{
          transform: [
            {
              rotate: tiltAnimation.interpolate({
                inputRange: [-1, 1],
                outputRange: [degLeft, degRight],
              }),
            },
          ],
        }}>
        <View>
          {endAnimation && renderIconDelete(item, index)}
          {Item(item, index)}
        </View>
      </Animated.View>
    ) : (
      <Text style={{ fontSize: sizeItemBtnDelete, fontWeight: "bold" }}>
        Hello
      </Text>
    );
  };

  const renderIconDelete = (item, index) => {
    return IconDelete ? (
      <Pressable
        onPress={() => handlerDeleteItem(index)}
        style={{
          position: "absolute",
          backgroundColor: "#828282",
          zIndex: 9999,
          top: 0,
          left: 0,
          width: 15,
          height: 15,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 20,
        }}>
        {IconDelete}
      </Pressable>
    ) : (
      <Pressable
        onPress={() => handlerDeleteItem(index)}
        style={{
          position: "absolute",
          backgroundColor: "#828282",
          zIndex: 9999,
          top: 0,
          left: 0,
          width: 15,
          height: 15,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 20,
        }}>
        <Text style={{ fontSize: 10, fontWeight: "bold", color: "#000000" }}>
          ─
        </Text>
      </Pressable>
    );
  };

  const handlerDeleteItem = (index) => {
    const currentIndex = data.findIndex((i, idx) => idx === index);
    const updatedDataShow = [...dataShow];
    updatedDataShow.splice(currentIndex, 1);

    setDataShow(updatedDataShow);
    clearTimeout(endAnimationTimeout.current);
    endAnimationTimeout.current = setTimeout(() => {
      stopShakeAnimation();
    }, 500);
  };

  const handlerLongPress = () => {
    Vibration.vibrate();
    startShakeAnimation();
    setEndAnimation(true);
  };

  const startShakeAnimation = () => {
    isAnimating.current = true;
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
      ])
    ).start(() => {
      tiltAnimation.setValue(0);
    });
  };

  const stopShakeAnimation = () => {
    setChildLPress(false);
    setChildSPress(false);
    setEndAnimation(false);
    tiltAnimation.stopAnimation();
    tiltAnimation.setValue(0);
  };

  return (
    <AutoDragSort
      dataSource={dataShow}
      parentWidth={parentWidth}
      parentHeight={parentHeight}
      childrenWidth={childrenWidth}
      childrenHeight={childrenHeight}
      marginChildrenBottom={marginChildrenBottom}
      marginChildrenRight={marginChildrenRight}
      marginChildrenLeft={marginChildrenLeft}
      marginChildrenTop={marginChildrenTop}
      keyExtractor={(item, index) => item?.item_id || index}
      renderItem={(item, index) => {
        return _renderItem(item, index);
      }}
      setChildSPress={setChildSPress}
      setChildLPress={setChildLPress}
      childLPress={childLPress}
    />
  );
};

export default DnDLikeIOS;
