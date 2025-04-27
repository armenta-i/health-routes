import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import DirectionItem from './DirectionItem'; // Import the single step component

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
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    padding: 16,
    height: 400, // Scrollable block
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default DirectionsList;
