// screens/SurveyListScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList } from 'react-native';

const SurveyListScreen = ({ navigation }) => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('http://192.168.1.170:5000/surveys');
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

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={surveys}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderRadius: 5 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
            <Button title="Start Survey" onPress={() => navigation.navigate('SurveyTaking', { surveyId: item.id })} />
          </View>
        )}
      />
    </View>
  );
};

export default SurveyListScreen;
