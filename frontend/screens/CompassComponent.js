import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Image } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import CompassImage from '../assets/compass.png'; // local import

const CompassComponent = () => {
  const [angle, setAngle] = useState(0);
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
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

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Choose source based on platform
  const compassSource = Platform.OS === 'web'
    ? { uri: '/assets/compass.png' }  // For web bundling
    : CompassImage;                   // For native apps

  return (
    <View style={styles.container}>
      <Animated.Image
        source={compassSource}
        style={[styles.compassImage, { transform: [{ rotate: rotation }] }]}
      />
      <Text style={styles.headingText}>{Math.round(angle)}°</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: 'center',
  },
  compassImage: {
    width: 200,
    height: 200,
  },
  headingText: {
    fontSize: 18,
    marginTop: 12,
    fontWeight: 'bold',
  },
});

export default CompassComponent;
