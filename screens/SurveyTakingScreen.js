import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';

const SurveyTakingScreen = ({ route, userId }) => { // Pass userId as a prop or get it from context
  const { surveyId } = route.params;
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchSurvey = async () => {
      const response = await fetch(`http://192.168.1.170:5000/surveys/${surveyId}`);
      const data = await response.json();
      setSurvey(data);
    };

    fetchSurvey();
  }, [surveyId]);

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available. Please log in.');
      return;
    }
    
    const response = await fetch('http://192.168.1.170:5000/submit_survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, survey_id: surveyId, responses: answers }),
    });

    const result = await response.json();
    if (result.success) {
      Alert.alert('Success', 'Survey responses submitted successfully!');
      // Optionally navigate to submission screen
    } else {
      Alert.alert('Error', 'Failed to submit responses.');
    }
  };

  if (!survey) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{survey.name}</Text>
      <FlatList
        data={survey.questions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 18 }}>{item.question}</Text>
            {item.options.map((option, optIndex) => (
              <Button
                key={optIndex}
                title={option}
                onPress={() => handleAnswerSelect(index, option)}
              />
            ))}
          </View>
        )}
      />
      <Button title="Submit Answers" onPress={handleSubmit} />
    </View>
  );
};

export default SurveyTakingScreen;
