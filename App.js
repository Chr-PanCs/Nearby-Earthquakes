import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';

import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';


export default function App() {
  const [EqStatus, setEqStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [location, setLocation] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Permission + GPS (reused from the Location demo)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setLocation(loc);
      // 2. Name the place. For smaller towns `city` is often empty,
      //    so fall through subregion → district → region → name.

      // 3. Ask USGS for the current Earthquake Catalog using GeoJSON object (no API key needed)
      const url =
      'https://earthquake.usgs.gov/fdsnws/event/1/query' +
      `?format=geojson&latitude=${latitude}&longitude=${longitude}` +
      '&maxradiuskm=300&limit=20&orderby=time';
      const res = await fetch(url);
      const json = await res.json();
      setEqStatus(json.features);
    } catch (e) {
      setError('Could not load Earthquakes — check your connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); 
  }, []);

  useEffect(() => {
    Accelerometer.setUpdateInterval(80); // ms  (~12 readings/sec)
    const sub = Accelerometer.addListener(setData);
    return () => sub.remove(); // cleanup when the screen closes
  }, []);


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#22D3EE" />
        <Text style={styles.sub}>Searching for Earthquakes around you…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.sub}>{error}</Text>
        <Pressable style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Σεισμοί κοντά μου</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <Text style={styles.locationtext}> Latitude:{location.coords.latitude.toFixed(6)} , Longitude: {location.coords.longitude.toFixed(6)}</Text> 
        <Text style={styles.locationtext}>Accuracy Radius (m): {location.coords.accuracy.toFixed(0)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Earthquakes (300km)</Text>

        <FlatList
          data={EqStatus}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.tiltState}>{item.properties.place}</Text>
              <Text>Magnitude: {item.properties.mag}, Time: {new Date(item.properties.time).toLocaleString()}</Text>
            </View>
          )}
        />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accelerometer Panel</Text>
        <Text style={styles.locationtext}>X: {x.toFixed(2)}, Y: {y.toFixed(2)}, Z: {z.toFixed(2)}</Text>
        <Text style={styles.locationtext}>Orientation: {
          x > 0.4
            ? 'Leaning to the left'
            : x < -0.4
              ?'Leaning to the right'
              : 'normal'
          }
        </Text>
      </View>

        <Pressable style={styles.button} onPress={load}>
          <Text style={styles.buttonText}>↻ Refresh</Text>
        </Pressable>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  section: { marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  locationtext: { fontSize: 14, color: '#666', textAlign: 'left' },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  list: { paddingBottom: 20 },
  item: { backgroundColor: '#fff', padding: 15, marginVertical: 6, borderRadius: 10, elevation: 3 },
  card: { padding: 12, backgroundColor: '#fff', marginBottom: 8, borderRadius: 6 },
  sensorPanel: { marginVertical: 20, padding: 15, backgroundColor: '#e3f2fd', borderRadius: 10 },
  accelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tiltState: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#1565c0' },
  empty: { textAlign: 'center', marginVertical: 20, color: '#666' },
  sub: { color: '#94A3B8', fontSize: 18, marginTop: 16 },
  emoji: { fontSize: 64, marginBottom: 12 },
});

