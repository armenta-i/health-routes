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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    height: 300, // Reduced height since map is primary
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default DirectionsList;
