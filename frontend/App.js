
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './components/pod_components/HomeScreen.js';
import TraineePodScreen from './components/pod_components/TraineePod.js';
import AssociatePodScreen from './components/pod_components/AssociatePod.js';
import PartnerPodScreen from './components/pod_components/PartnerPod.js';
import LoginScreen from './components/LoginPage.js';
import OutcomesScreen from './components/outcomes/OutcomesScreen.js';
import FocusGoals from './components/outcomes/FocusGoals.js';

import { isTokenValid, removeToken, getAccessToken } from "./utils/auth";
import { Footer } from 'native-base';
import Constants from 'expo-constants';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/* Higher order function that returns the component binded with refresh_func */
function componentWithRefreshFunc(Component, refresh_func) {
    return function ({...rest}) {
        return <Component refresh={refresh_func} {...rest}/>
    }
}

export default class MainNavigator extends React.Component {
    state = {
        loggedIn: false
    };

    // refreshes login state, updating screen being displayed.
    refreshLoginState = () => {
        console.log("State updated.")
        isTokenValid().then(valid => {
            this.setState({loggedIn: valid});
        });
    }

    /* removes the token and refreshes the state */
    logout = async () => {
        await removeToken();
        this.refreshLoginState();
    }

    componentDidMount() {
        this.refreshLoginState();
    }

    render() {
        return (
            <NavigationContainer>
                {this.state.loggedIn ? (
                    <MainTabNavigator 
                        loggedIn={this.state.loggedIn}
                        logout={this.logout}
                    />
                ) : (
                    <Stack.Navigator>
                        <Stack.Screen
                            name="Login Screen"
                            component={componentWithRefreshFunc(LoginScreen, this.refreshLoginState)}
                            options={{
                                animationEnabled: false,
                            }}
                        />
                    </Stack.Navigator>
                )}
            </NavigationContainer>
        );
    }
}

class MainTabNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            allData: {}
        };
    }

    async componentDidMount() {
        if (!this.props.loggedIn) {
            console.log("Component mount and not logged in");
            return;
        } else {
            console.log("Component mount and logged in");
            await fetch(`${Constants.manifest.extra.apiUrl}/getMainGoals`, {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + await getAccessToken(),
                },
            })
            .then(response => response.json())
            .then(queryData => {
                let allData = {};
                
                // Extract all outcome titles for later use
                for (const podName in queryData) {
                    let newData = [];
                    let data = queryData[podName];
                    
                    function findAndUpdate(key, index, fieldName) {
                        // Get ID of the current key so we can match with existing entry
                        let words_in_key = key.split("_");
                        let curr_id = words_in_key[words_in_key.length - 3].toLowerCase();
                        // Finds index of object in content array to update
                        let content_index = newData[index].content.findIndex(x => {
                            return x.id === curr_id;
                        });
                        // If the corresponding youth exists for the YDM field, update the value
                        if (content_index >= 0) {
                            // Update ydmApproved field in existing entry
                            newData[index].content[content_index][fieldName] = data[key]["value"];
                        }
                    }

                    for (const api_name in data) {
                        // console.log(api_name);
                        if (api_name.includes("Outcome") && !api_name.includes("Outcomes")) {
                            newData.push({
                                id: api_name.substring(0, 3),
                                title: data[api_name]["name"],
                                content: []
                            });
                        }
                    }

                    // Create all content objects based on the youth fields
                    for (const key in data) {
                        let key_id = key.substring(0, 3);
                        let index = newData.findIndex(x => x.id === key_id);
                        if (key.includes("Youth") && index >= 0 && !key.includes("BOOL")) {
                            let words_in_key = key.split("_");
                            newData[index].content.push({
                                api_key: key,
                                id: words_in_key[words_in_key.length - 3].toLowerCase(),
                                key: data[key]["name"],
                                ydmApproved: true,
                                checked: data[key]["value"],
                                starIsFilled: false, // Change later based on salesforce data
                            });
                        }
                    }

                    // Update all ydmApproved values based on YDM fields
                    for (const key in data) {
                        let key_id = key.substring(0, 3);
                        let index = newData.findIndex(x => x.id === key_id);
                        if (key.includes("YDM") && index >= 0) {
                            findAndUpdate(key, index, "ydmApproved");
                        }
                        if (key.includes("BOOL") && index >= 0) {
                            findAndUpdate(key, index, "starIsFilled");
                        }
                    }

                    allData[podName] = newData;
                }

                this.setState({
                    allData: allData
                });
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    render() {
        return (
            <Tab.Navigator>
                <Tab.Screen
                    name="Home"
                    children={ () => <MainStackNavigator logout={this.props.logout}/> }
                    options={{
                        tabBarLabel: 'Main Screen',
                        tabBarIcon: ({ color, size }) => (
                            <Icon
                            name="outlet"
                            color={color}
                            size={size}
                            />
                        ),
                    }} 
                />
                <Tab.Screen 
                    name="FocusGoals"
                    children={ () => <FocusGoalsStackNavigator
                                        allData={this.state.allData}
                                     />}
                    options={{
                        tabBarLabel: 'Focus Goals',
                        tabBarIcon: ({ color, size }) => (
                            <Icon
                            name="playlist-add-check"
                            color={color}
                            size={size}
                            />
                        ),
                    }} 
                />
            </Tab.Navigator>
        );
    }
}

class FocusGoalsStackNavigator extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Stack.Navigator>
                <Stack.Screen 
                    name="Focus Goals"
                    children={ () => <FocusGoals
                                        allData={this.props.allData}
                                     />} 
                />
            </Stack.Navigator>
        );
    }
}

class MainStackNavigator extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Stack.Navigator>
                <>
                    <Stack.Screen
                        name="Pods"
                        component={HomeScreen}
                        options={{
                            headerRight: () =>
                                <TouchableOpacity onPress={this.props.logout} style={{marginRight: 16}}>
                                    <Text>Log Out</Text>
                                </TouchableOpacity>,
                            animationEnabled: false
                        }}
                    />
                    <Stack.Screen name="Trainee Pod" component={TraineePodScreen} />
                    <Stack.Screen name="Associate Pod" component={AssociatePodScreen} />
                    <Stack.Screen name="Partner Pod" component={PartnerPodScreen} />
                    <Stack.Screen name="Random Screen" component={RandomScreen} />
                    <Stack.Screen name="Outcomes" component={OutcomesScreen} />
                </>
            </Stack.Navigator>
        );
    }
}

function RandomScreen() {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    When the competencies screen, career pathway screen, and life
                    essential screens get set up, replace this screen with them.
                </Text>
            </View>
        </ScrollView>
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
    scrollView: {
        backgroundColor: 'white'
    }
});
