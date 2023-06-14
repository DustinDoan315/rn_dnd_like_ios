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
  data,
  marginTopContain,
  widthContain,
  justifyContentContain,
  paddingHorizontalContain,
  widthItem,
  heightItem,
  radiusItem,
  backgroundColorItem,
  justifyItem,
  alignItem,
  marginRightItem,
  marginBottomItem,
  children,
  btnDeleteTop,
  btnDeleteLeft,
  backgroundColorBtnDelete,
  widthBtnDelete,
  heightBtnDelete,
  radiusBtnDelete,
  justifyBtnDelete,
  alignBtnDelete,
  valueShakeLeft,
  durationShakeLeft,
  valueShakeRight,
  durationShakeRight,
  degLeft,
  degRight,
  onPressBtnDelete,
  sizeItemBtnDelete,
}) => {
  const tiltAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const endAnimationTimeout = useRef(null);
  const [endAnimation, setEndAnimation] = useState(false);

  useEffect(() => {
    if (endAnimation) {
      endAnimationTimeout.current = setTimeout(() => {
        stopShakeAnimation();
      }, 10000);
    } else {
      clearTimeout(endAnimationTimeout.current);
    }

    return () => {
      clearTimeout(endAnimationTimeout.current);
    };
  }, [endAnimation]);

  const renderIconDelete = () => {
    return IconDelete ? (
      <Pressable onPress={onPressBtnDelete} style={styles.btn_delete}>
        {IconDelete}
      </Pressable>
    ) : (
      <Pressable onPress={onPressBtnDelete} style={styles.btn_delete}>
        <Text style={{fontSize: sizeItemBtnDelete || 16, fontWeight: 'bold'}}>
          x
        </Text>
      </Pressable>
    );
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
          toValue: valueShakeLeft || 0.25,
          duration: durationShakeLeft || 75,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeRight || -0.25,
          duration: durationShakeRight || 75,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeLeft || 0.25,
          duration: durationShakeLeft || 75,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnimation, {
          toValue: valueShakeRight || -0.25,
          duration: durationShakeRight || 75,
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
      marginTop: marginTopContain || 15,
      width: widthContain || '100%',
      justifyContent: justifyContentContain || 'space-between',
      paddingHorizontal: paddingHorizontalContain || 15,
    },
    item: {
      width: widthItem || 100,
      height: heightItem || 100,
      borderRadius: radiusItem || 20,
      backgroundColor: backgroundColorItem || 'crimson',
      justifyContent: justifyItem || 'center',
      alignItems: alignItem || 'center',
      marginRight: marginRightItem || 10,
      marginBottom: marginBottomItem || 10,
    },
    btn_delete: {
      position: 'absolute',
      top: btnDeleteTop || -10,
      left: btnDeleteLeft || -10,
      backgroundColor: backgroundColorBtnDelete || 'yellow',
      width: widthBtnDelete || 30,
      height: heightBtnDelete || 30,
      borderRadius: radiusBtnDelete || 20,
      justifyContent: justifyBtnDelete || 'center',
      alignItems: alignBtnDelete || 'center',
    },
  });

  return (
    <ScrollView>
      <View style={styles.main}>
        {data?.map((item, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [
                {
                  rotate: tiltAnimation.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [degLeft || '-10deg', degRight || '10deg'],
                  }),
                },
              ],
            }}>
            <Pressable
              onPress={stopShakeAnimation}
              onLongPress={handlerLongPress}
              style={styles.item}>
              {children}

              {renderIconDelete()}
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Component;
