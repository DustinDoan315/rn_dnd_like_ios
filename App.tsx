import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import Component from './Component';

const users = [
  {name: 'John', age: '21'},
  {name: 'Dong', age: '21'},

  {name: 'Doan', age: '21'},

  {name: 'Khanh', age: '21'},

  {name: 'Harry', age: '21'},
  {name: 'John', age: '21'},
  {name: 'John', age: '21'},
];
const _renderItems = item => {
  return (
    <View>
      <Text>{item?.name}</Text>
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <Component
        marginLeftItem={10}
        renderItem={_renderItems}
        data={users}
        marginTopContain={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9CD7CB',
  },
  main: {},
});

export default App;
