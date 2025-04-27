import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import DirectionItem from './DirectionItem';

const DirectionsList = ({ directions }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step 3: Driving Directions</Text>

      <ScrollView style={styles.scrollContainer}>
        {directions.map((step, index) => (
          <DirectionItem
            key={index}
            number={index + 1}
            instruction={step.instruction.replace(/<[^>]+>/g, '')}
            distance={step.distance}
            duration={step.duration}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff', // White background
    borderRadius: 8,
    padding: 16,
    height: 400, // Scrollable block
    shadowColor: 'gray',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 12,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default DirectionsList;
