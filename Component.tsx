import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Vibration,
  Animated,
  Easing,
} from 'react-native';

const Component = ({
  IconDelete,
  data = [],
  marginTopContain = 15,
  widthContain = '100%',
  justifyContentContain,
  paddingHorizontalContain = 15,
  widthItem = 100,
  heightItem = 100,
  radiusItem = 20,
  backgroundColorItem = 'crimson',
  justifyItem = 'center',
  alignItem = 'center',
  marginRightItem = 10,
  marginLeftItem = 0,
  marginBottomItem = 10,
  children,
  btnDeleteTop = -10,
  btnDeleteLeft = -10,
  backgroundColorBtnDelete = 'yellow',
  widthBtnDelete = 30,
  heightBtnDelete = 30,
  radiusBtnDelete = 20,
  justifyBtnDelete = 'center',
  alignBtnDelete = 'center',
  valueShakeLeft = 0.25,
  durationShakeLeft = 75,
  valueShakeRight = -0.25,
  durationShakeRight = 75,
  degLeft = '-10deg',
  degRight = '10deg',
  sizeItemBtnDelete = 16,
  timeoutShake = 20000,
  renderItem,
}) => {
  const tiltAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const endAnimationTimeout = useRef(null);
  const [endAnimation, setEndAnimation] = useState(false);
  const [dataShow, setDataShow] = useState(data);

  useEffect(() => {
    if (endAnimation) {
      endAnimationTimeout.current = setTimeout(() => {
        stopShakeAnimation();
      }, timeoutShake);
    } else {
      clearTimeout(endAnimationTimeout.current);
    }

    return () => {
      clearTimeout(endAnimationTimeout.current);
    };
  }, [endAnimation]);

  const _renderItem = item => {
    return renderItem ? (
      renderItem(item)
    ) : (
      <Text style={{fontSize: sizeItemBtnDelete, fontWeight: 'bold'}}>
        Hello
      </Text>
    );
  };

  const renderIconDelete = (item, index) => {
    return IconDelete ? (
      <Pressable
        onPress={() => handlerDeleteItem(index)}
        style={styles.btnDelete}>
        {IconDelete}
      </Pressable>
    ) : (
      <Pressable
        onPress={() => handlerDeleteItem(index)}
        style={styles.btnDelete}>
        <Text style={{fontSize: sizeItemBtnDelete, fontWeight: 'bold'}}>x</Text>
      </Pressable>
    );
  };

  const handlerDeleteItem = (index: number) => {
    currentIndex = data.findIndex((i, idx) => idx === index);
    dataShow.splice(currentIndex, 1);
    setDataShow(dataShow);
    stopShakeAnimation();
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
      ]),
    ).start(() => {
      tiltAnimation.setValue(0);
    });
  };

  const stopShakeAnimation = () => {
    setEndAnimation(false);
    tiltAnimation.stopAnimation();
    tiltAnimation.setValue(0);
  };

  const styles = StyleSheet.create({
    main: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: marginTopContain,
      width: widthContain,
      justifyContent: justifyContentContain,
      paddingHorizontal: paddingHorizontalContain,
    },
    item: {
      width: widthItem,
      height: heightItem,
      borderRadius: radiusItem,
      backgroundColor: backgroundColorItem,
      justifyContent: justifyItem,
      alignItems: alignItem,
      marginRight: marginRightItem,
      marginLeft: marginLeftItem,
      marginBottom: marginBottomItem,
    },
    btnDelete: {
      position: 'absolute',
      top: btnDeleteTop,
      left: btnDeleteLeft,
      backgroundColor: backgroundColorBtnDelete,
      width: widthBtnDelete,
      height: heightBtnDelete,
      borderRadius: radiusBtnDelete,
      justifyContent: justifyBtnDelete,
      alignItems: alignBtnDelete,
    },
  });

  return (
    <ScrollView>
      <View style={styles.main}>
        {dataShow?.map((item, index) => (
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
            <Pressable
              onPress={stopShakeAnimation}
              onLongPress={handlerLongPress}
              style={styles.item}>
              {children}
              {_renderItem(item)}
              {endAnimation && renderIconDelete(item, index)}
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Component;
