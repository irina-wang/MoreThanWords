import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export default function AssociatePodScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>
                ASSOCIATE POD
            </Text>
            
            <TouchableOpacity 
                style={styles.block} 
                onPress={() => navigation.navigate('Random Screen')}
            >
                <Text style={styles.blockText}>
                    Competencies
                </Text>
                
                <Text>Outcomes Achieved</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.block} 
                onPress={() => navigation.navigate('Random Screen')}
            >
                <Text style={styles.blockText}>
                    Career Pathway
                </Text>
                <Text>Outcomes Achieved</Text>
            </TouchableOpacity>
        
            <TouchableOpacity 
                style={styles.block} 
                onPress={() => navigation.navigate('Random Screen')}
            >
                <Text style={styles.blockText}>
                    Life Essentials/ Support Network
                </Text>
                <Text>Outcomes Achieved</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 30,
        marginTop: 20,
        fontWeight: 'bold',
    },
    block: {
        marginTop: 40,
        width: 300,
        height: 180,
        backgroundColor: '#fae484',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blockText: {
        fontSize: 25,
        textAlign: 'center',
    },
});