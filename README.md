# React Native Drag and Drop like IOS

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

## Usage

```javascript
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

const Item = (item, index) => {
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
  return (
    <View style={styles.container}>
      <DnDLikeIOS
        parentWidth={width}
        parentHeight={height}
        Item={Item}
        data={users}
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

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
