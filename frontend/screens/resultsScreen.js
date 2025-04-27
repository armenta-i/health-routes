import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

export default function ResultsScreen({ route }) {
  const { location, language, medical_issue } = route.params;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`http://your_backend_ip:8000/medical-results?location=${location}&language=${language}&medical_issue=${medical_issue}`);
        const data = await response.json();
        if (response.ok) {
          setResults(data.results);
        } else {
          console.error('Error fetching results:', data.detail);
        }
      } catch (error) {
        console.error('Network error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recommended Healthcare Options</Text>
      {results.length === 0 ? (
        <Text>No matches found. Try updating your search criteria.</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `result-${index}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.address}</Text>
              <Text>{item.phone_number}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
