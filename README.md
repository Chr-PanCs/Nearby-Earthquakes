EarthquakesNearMe_ExpoGo

A MSc assignment in React Native with Expo GO for Nearby Earthquakes

This is a prototype application made using Expo GO in React Native.
- Primary function of this app is to connect to USGS Earthquake Hazards Program https://earthquake.usgs.gov/fdsnws/event/1/
- search for earthquakes in a radius of 300km around the user
- Show Accelerometer Data and TiltState at the bottom of the screen

Libraries used:
- `{ Accelerometer } from 'expo-sensors'`
- `Location from 'expo-location';`

## Setup

1. Create a blank Expo app (once): `npx create-expo-app@latest demo --template blank`
2. Replace `demo/App.js` with the `App.js` in this folder.
3. Install this app's packages inside `demo/`:

```bash
npx expo install expo-location
npx expo install expo-sensors
```

4. Start it and scan the QR with Expo Go:

```bash
npx expo start
```

