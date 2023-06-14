import {View, Text, ScrollView, StyleSheet} from 'react-native';
import React from 'react';
import Component from './Component';

const users = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23,
];

const App = () => {
  return (
    <View style={styles.container}>
      <Component
        // IconDelete={
        //   <View>
        //     <Text style={{color: 'green'}}>LOL</Text>
        //   </View>
        // }
        data={users}
        marginTopContain={10}>
        <Text>Hello</Text>
      </Component>
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
