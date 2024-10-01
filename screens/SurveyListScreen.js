import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Import the Header component
import { View, Text, Button, FlatList } from 'react-native';

const SurveyListScreen = ({ navigation, route }) => {
  // Retrieve the userId from the route params
  const userId = route.params.userId;

  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('http://192.168.43.56:5000/surveys');
        const data = await response.json();
        // Check if the response contains surveys and update the state
        if (data.surveys) {
          setSurveys(data.surveys);
        } else {
          console.error("No surveys found");
        }
      } catch (error) {
        console.error("Error fetching surveys:", error);
      }
    };

    fetchSurveys();
  }, []);

  // Function to handle the survey start and pass userId and surveyId
  const handleStartSurvey = (surveyId) => {
    // Navigate to SurveyTakingScreen with both surveyId and userId
    navigation.navigate('SurveyTaking', { surveyId: surveyId, userId: userId });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Render the Header at the top */}
      <Header title="Survey List" />
    <View style={{ padding: 20 }}>
      <FlatList
        data={surveys}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderRadius: 5 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
            {/* Pass surveyId and userId when starting the survey */}
            <Button title="Start Survey" onPress={() => handleStartSurvey(item.id)} />
          </View>
        )}
      />
    </View>
    </View>
  );
};

export default SurveyListScreen;
