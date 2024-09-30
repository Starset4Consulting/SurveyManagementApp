// screens/AdminDashboardScreen.js
import React from 'react';
import { View, Button } from 'react-native';

const AdminDashboardScreen = ({ navigation }) => {
  return (
    <View style={{ padding: 20 }}>
      <Button title="Create Survey" onPress={() => navigation.navigate('SurveyCreation')} />
      <Button title="View Survey List" onPress={() => navigation.navigate('SurveyList')} />
    </View>
  );
};

export default AdminDashboardScreen;
