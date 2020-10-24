import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Image } from 'react-native';
import Constants from 'expo-constants';

class PasswordResetPage extends React.Component {
    state = {
        "email": ""
    }

    /*
     * async member function send_email
     *
     * sends a request to the flask server for a email verification error to be sent.
     * Alerts the user whether the request is successful or not.
     */
    send_email = async () => {
        const request_body = {
            "email": this.state.email
        }

        try {
            // prepare and the request
            const response = await fetch(`${Constants.manifest.extra.apiUrl}reset`, {
                method: 'POST',
                body: JSON.stringify(request_body),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const response_body = await response.json();

            // gives alert based on response
            if (response.status != 200 || !('status' in response_body) || response_body.status !== 'good') {
                Alert.alert("Sorry! your request failed.", response_body['data']);
            } else {
                Alert.alert("Success!", response_body['data']); 
            }

        } catch (e) {
            console.log(e);
            Alert.alert("Sorry! your request failed.", "Network connection failed.");
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.logo} source={require('../static/Transparent_MTW_Logo.png')}/>
                <Text style={{fontSize: 20, textAlign: 'left'}}>Please Enter your Email below:</Text>
                <TextInput
                    onChangeText={text => {
                        this.setState({"email": text});
                    }}
                    style={{ height: 40, alignSelf: 'stretch', borderWidth: 1 }}
                />
                <Button
                    title="Submit"
                    onPress={this.send_email}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }, logo: {
      width: 100,
      height: 50
  }
});

export default PasswordResetPage;
