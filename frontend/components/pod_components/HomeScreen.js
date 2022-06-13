import Constants from 'expo-constants';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import HomeScreenPod from './HomeScreenPod.js'
import {RefreshControl, Text} from "react-native";
import LoadingModal from "../LoadingModal";
import { getAccessToken } from '../../utils/auth.js';

const server_add = Constants.manifest.extra.apiUrl;

export default class HomeScreen extends React.Component {
    // set initial state for pod updates
    state = {
        numSucceeded: 0,
        refreshing: false,
        pods: null,
        progress_data: null
    }

    // use set_loading & loading to mark the fetching state
    // separate fetching from componentDidMount to avoid fetching failure or null values that terminates the code 
    fetchData = async (set_loading = true) => {
        // start loading  
        if (set_loading) this.setState({loading: true});
        let { pods } = this.state;
        const token = await getAccessToken();
        
        // fetch data if pod is null 
        if (!pods) {
            const res = await fetch(server_add + "/getValidPods", {
                headers: { 
                    "Authorization": "Bearer " + token  // Bearer authentication scheme 
                }
            });
            
            // update pods data in state
            pods = await res.json();
            this.setState({ pods });
        }
            const res2 = await fetch(server_add + "/calcProgressHomeScreen", {
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token,
                },
            });
        
            // update progress data in state
            const progress_data = await res2.json();
            this.setState({ progress_data, loading: false });  // end loading  
    }
    
    componentDidMount() {
        this.fetchData(false);
    }

    render() {
        // retrieve state values 
        const { progress_data, pods } = this.state;
        return(
            <ScrollView
                style={{backgroundColor: '#ffffff' }}
                refreshControl={
                    <RefreshControl 
                        refreshing={this.state.refreshing} 
                        onRefresh={this.fetchData}/>} // fetch data upon refresh
            >
                
            /* Syntax ( condition ? value1 : value2 ) */
                
                // check if progress_data or pods is empty (condition)
                {progress_data && pods ?
                 
                // assign pod values if data is fetched (value 1)
                <SafeAreaView style={{backgroundColor: '#ffffff' }}>
                    {Object.keys(pods).map((pod, index) => 
                                <HomeScreenPod
                                    pod={pod.slice(0, -11) /* removing suffix */}
                                    key={index}
                                    route={this.props.route}
                                    navigation={this.props.navigation}
                                    pod_data={pods[pod]}
                                    progress_data={progress_data[pod]}
                                />
                    )}
                </SafeAreaView>  :
 
                // display white background if data is empty (value 2)
                <SafeAreaView style={{backgroundColor: '#ffffff' }}>
                    <LoadingModal/>
                </SafeAreaView>
                    
                }
            </ScrollView>
        );
    }
}
