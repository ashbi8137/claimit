import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkingPage: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Working Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WorkingPage; 