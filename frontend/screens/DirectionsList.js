import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import DirectionItem from './DirectionItem';

const DirectionsList = ({ directions }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Turn-by-Turn Directions</Text>
      <Text style={styles.subtitle}>Tap "Start Navigation" on map for real-time guidance</Text>

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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    height: 300, // Reduced height since map is primary
    shadowColor: 'gray',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  scrollContainer: {
    flex: 1,
  },
});

export default DirectionsList;
