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
        // Mobile shadow
        elevation: 2,
        // Web shadow
        boxShadow: '0px 2px 4px gray',
      }
      ,
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'black', // Black circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
    color: 'black',
  },
  subText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default DirectionItem;
