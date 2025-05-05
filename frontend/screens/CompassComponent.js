import React, { useState, useEffect } from 'react';
import { View, Image, Animated, StyleSheet, Platform, Text } from 'react-native';
import { Magnetometer } from 'expo-sensors';

const CompassComponent = () => {
  const [angle, setAngle] = useState(0);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const compassSource = Platform.OS === 'web'
    ? { uri: '/compass.png' }
    : require('../assets/compass.png'); // Adjust path if needed

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Don't use magnetometer on web
      return;
    }

    const subscription = Magnetometer.addListener(data => {
      const { x, y } = data;
      let heading = Math.atan2(y, x) * (180 / Math.PI);
      heading = heading >= 0 ? heading : heading + 360;
      setAngle(heading);

      Animated.timing(rotateAnim, {
        toValue: heading,
        duration: 100,
        useNativeDriver: true,
      }).start();
    });

    return () => subscription && subscription.remove();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={compassSource}
        style={[styles.compass, { transform: [{ rotate }] }]}
        resizeMode="contain"
      />
      <Text style={styles.angleText}>{Math.round(angle)}°</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  compass: {
    width: 200,
    height: 200,
  },
  angleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default CompassComponent;
