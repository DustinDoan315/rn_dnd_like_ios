# React Native Drag and Drop like IOS
[![npm downloads](https://img.shields.io/npm/dm/react-native-dnd-like-ios.svg)](https://www.npmjs.com/package/react-native-dnd-like-ios)

"react-native-dnd-like-ios" is a powerful JavaScript library for creating captivating animations in your React Native applications. This library empowers developers to effortlessly incorporate smooth and fluid drag-and-drop interactions, inspired by the intuitive iOS user interface.

## Intro

![image](https://github.com/HarryDoan/react-native-dnd-like-ios/assets/87471806/471e4857-a26c-4a5b-9550-ca2cb7d3cd6f)

## Installation

Install the library using npm or Yarn. Open your project's terminal and run one of the following commands:

```bash
npm install react-native-dnd-like-ios

```

or

```bash
yarn add react-native-dnd-like-ios

```

## Setup

#### Add this line to the AndroidManifest.xml file for permissions.

```bash
<uses-permission android:name="android.permission.VIBRATE"/>

```

## Quickstart

```javascript
import React, { useState } from "react";
import { View, Text, Dimensions } from "react-native";
import DnDLikeIOS from "react-native-dnd-like-ios";
const { width, height } = Dimensions.get("window");

const users = [
  { name: "Name_No1" },
  { name: "Name_No2" },
  { name: "Name_No3" },
  { name: "Name_No4" },
  { name: "Name_No5" },
  { name: "Name_No6" },
  { name: "Name_No7" },
];

const _renderItem = (item, index) => {
  return (
    <View
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        width: 75,
        height: 75,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
      }}>
      <Text>{item?.name}</Text>
    </View>
  );
};

const App = () => {
  const [newData, setNewData] = useState([]);

  return (
    <View style={styles.container}>
      <DnDLikeIOS
        parentWidth={width}
        parentHeight={height}
        Item={_renderItem}
        data={users}
        setNewDataSource={setNewData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#9CD7CB",
  },
});
```

## Document

| Prop             | Defined                                                                | Type     |
| -------------------- | ---------------------------------------------------------------------- | -------- |
| data                 | List the data used to render each list item.                           | Array    |
| setNewDataSource     | Return the new data when a handler deletes an item in the list.        | Function |
| Item                 | This is the child component you want to show.                          | Function |
| IconDelete           | This is the icon delete you want to show.                              | Function |
| parentWidth          | This is width of your component you want render                        | Number   |
| parentHeight         | This is height of your component you want render                       | Number   |
| childrenWidth        | This is width of your Child item component you want render             | Number   |
| childrenHeight       | This is height of your Child item component you want render            | Number   |
| widthIconDelete      | This is width of icon delete                                           | Number   |
| heightIconDelete     | This is height of icon delete                                          | Number   |
| radiusIconDelete     | This is border radius of icon delete                                   | Number   |
| topIconDelete        | This is position top of icon delete                                    | Number   |
| leftIconDelete       | This is position left of icon delete                                   | Number   |
| degLeft              | This is the value to shake the Child item component to the left        | String   |
| degRight             | This is the value to shake the Child item component to the right       | String   |
| timeoutShake         | This is the time at which the shaking stops                            | Number   |
| durationShakeLeft    | This is the time to shake the Child item component to the left         | Number   |
| valueShakeRight      | This is the value to shake the Child item component to the right       | Number   |
| durationShakeRight   | This is the time to shake the Child item component to the right        | Number   |
| marginChildrenBottom | This is the value to set the margin bottom of the Child item component | Number   |
| marginChildrenRight  | This is the value to set the margin right of the Child item component  | Number   |
| marginChildrenLeft   | This is the value to set the margin left of the Child item component   | Number   |
| marginChildrenTop    | This is the value to set the margin top of the Child item component    | Number   |

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
