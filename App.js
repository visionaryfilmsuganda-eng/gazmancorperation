import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

export default function App() {
  const [nextFlight, setNextFlight] = useState(null);
  const [flightDuration, setFlightDuration] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API endpoints
  const API_BASE_URL = 'https://aviator-api.spribe.io/s';
  
  // Fetch game data on component mount
  useEffect(() => {
    fetchLatestGameData();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchLatestGameData();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to fetch latest game data from API
  const fetchLatestGameData = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/recent-games`);
      
      if (response.data && response.data.games && response.data.games.length > 0) {
        // Process the game data
        processGameData(response.data.games);
      } else {
        console.log('No game data available');
      }
    } catch (err) {
      console.error('Error fetching game data:', err);
      setError('Failed to fetch game data. Using fallback prediction.');
      // Use fallback prediction if API fails
      useFallbackPrediction();
    }
  };
  
  // Process game data from API
  const processGameData = (games) => {
    // Calculate average time between games
    const timeBetweenGames = calculateTimeBetweenGames(games);
    
    // Calculate average flight duration
    const avgDuration = calculateAverageDuration(games);
    
    // Predict next flight time based on the last game time + average time between games
    const lastGameTime = new Date(games[0].timestamp);
    const predictedNextTime = new Date(lastGameTime.getTime() + timeBetweenGames);
    
    setNextFlight(predictedNextTime);
    setFlightDuration(Math.round(avgDuration));
    
    // Add to history
    const newPrediction = {
      id: Date.now(),
      predictedTime: predictedNextTime,
      predictedDuration: Math.round(avgDuration),
      source: 'API'
    };
    
    setHistory(prevHistory => [newPrediction, ...prevHistory].slice(0, 10));
  };
  
  // Calculate average time between games
  const calculateTimeBetweenGames = (games) => {
    if (games.length < 2) return 30000; // Default to 30 seconds if not enough data
    
    let totalTime = 0;
    for (let i = 0; i < games.length - 1; i++) {
      const currentGame = new Date(games[i].timestamp);
      const nextGame = new Date(games[i + 1].timestamp);
      totalTime += currentGame.getTime() - nextGame.getTime();
    }
    
    return Math.abs(totalTime / (games.length - 1));
  };
  
  // Calculate average flight duration
  const calculateAverageDuration = (games) => {
    if (games.length === 0) return 15; // Default to 15 seconds if no data
    
    const totalDuration = games.reduce((sum, game) => sum + game.duration, 0);
    return totalDuration / games.length;
  };
  
  // Fallback prediction method when API fails
  const useFallbackPrediction = () => {
    // Random time between 5 seconds and 2 minutes from now
    const nextFlightTime = new Date();
    nextFlightTime.setSeconds(nextFlightTime.getSeconds() + Math.floor(Math.random() * 115) + 5);
    
    // Random duration between 1 and 30 seconds
    const duration = Math.floor(Math.random() * 30) + 1;
    
    setNextFlight(nextFlightTime);
    setFlightDuration(duration);
    
    // Add to history with fallback source
    const newPrediction = {
      id: Date.now(),
      predictedTime: nextFlightTime,
      predictedDuration: duration,
      source: 'Fallback'
    };
    
    setHistory(prevHistory => [newPrediction, ...prevHistory].slice(0, 10));
  };
  
  // Function to predict next flight time (manual trigger)
  const predictNextFlight = () => {
    setLoading(true);
    
    // Call the API to get fresh data
    fetchLatestGameData()
      .catch(err => {
        console.error('Error in manual prediction:', err);
        useFallbackPrediction();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  // Calculate time remaining until next flight
  const getTimeRemaining = () => {
    if (!nextFlight) return 'Unknown';
    
    const now = new Date();
    const diff = Math.max(0, Math.floor((nextFlight - now) / 1000));
    
    if (diff <= 0) return 'Now!';
    
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Aviator Predictor</Text>
      </View>
      
      <View style={styles.predictionContainer}>
        <View style={styles.predictionBox}>
          <Text style={styles.predictionLabel}>Next Flight</Text>
          <Text style={styles.predictionValue}>{formatTime(nextFlight)}</Text>
          <Text style={styles.countdownLabel}>Time Remaining</Text>
          <Text style={styles.countdownValue}>{getTimeRemaining()}</Text>
        </View>
        
        <View style={styles.predictionBox}>
          <Text style={styles.predictionLabel}>Estimated Duration</Text>
          <Text style={styles.predictionValue}>
            {flightDuration ? `${flightDuration} seconds` : '--'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.predictButton, loading && styles.predictButtonDisabled]}
        onPress={predictNextFlight}
        disabled={loading}
      >
        <Text style={styles.predictButtonText}>
          {loading ? 'Predicting...' : 'Predict Next Flight'}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Prediction History</Text>
        <ScrollView style={styles.historyList}>
          {history.length > 0 ? (
            history.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyTime}>
                  Predicted: {formatTime(item.predictedTime)}
                </Text>
                <Text style={styles.historyDuration}>
                  Duration: {item.predictedDuration} seconds
                </Text>
                {item.source && (
                  <Text style={[styles.historySource, 
                    item.source === 'API' ? styles.apiSource : styles.fallbackSource]}>
                    Source: {item.source}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistory}>No predictions yet</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: 'rgba(230, 57, 70, 0.2)',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#E63946',
  },
  errorText: {
    color: '#E63946',
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E63946',
    textTransform: 'uppercase',
  },
  predictionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  predictionBox: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 15,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 5,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  predictButton: {
    backgroundColor: '#E63946',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  predictButtonDisabled: {
    backgroundColor: '#7D3B42',
    shadowOpacity: 0.1,
  },
  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyContainer: {
    flex: 1,
    padding: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4ECDC4',
  },
  historyTime: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  historyDuration: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  emptyHistory: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  historySource: {
    fontSize: 12,
    marginTop: 5,
  },
  apiSource: {
    color: '#4ECDC4',
  },
  fallbackSource: {
    color: '#FFA500',
  },
});