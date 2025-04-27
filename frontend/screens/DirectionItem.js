import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DirectionItem = ({ number, instruction, distance, duration }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>{instruction}</Text>
        <Text style={styles.subText}>
          {distance} • {duration}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0288d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold',
  },
  instructionContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  subText: {
    fontSize: 14,
    color: '#666',
  },
});

export default DirectionItem;
