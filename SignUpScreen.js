import React, { useState, useEffect, useRef } from 'react';
import { DotIndicator } from 'react-native-indicators';
import Permissions from './AppPermissionsScreen';
import { View, Text, LogBox, StyleSheet, ImageBackground, ActivityIndicator, Alert, TouchableOpacity, Platform, Image } from 'react-native';
import * as Linking from 'expo-linking';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAuthRequest, RefreshTokenRequestConfig, TokenResponse, TokenResponseConfig, useAutoDiscovery } from 'expo-auth-session';
import CountDown from 'react-native-countdown-component';
import UserDashboard from './UserDashboardScreen';
import ModuleSelectionScreen from './ModuleSelctionScreen'
import { GlobalData } from "../constants/constant";
import { StatusBar } from 'expo-status-bar';
import { firebaseConfig } from '../config';
import * as firebaseobj from 'firebase';
import { setErrorHandler } from 'expo-error-log/setErrorHandler.js';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Device from 'expo-device';
import SetAppGoalScreen from './SetAppGoalScreen';
import jwtDecode from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from "../constants/colors";
import { FontFamilies } from "../constants/fontFamilies";
import UserRegisteration from '../components/UserRegisteration'
import { registerAnimation } from 'react-native-animatable';
import { createIconSetFromFontello } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();
global.globalVar
global.b2CToken
global.audioPlay = true
global.ShowText = true
if (!firebaseobj.apps.length) {
    firebaseobj.initializeApp(firebaseConfig);
}
var appNameAndSlug = GlobalData.constData.expoUserName + GlobalData.constData.appSlug

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
});

const getPushToken = async () => {
    if (!Device.isDevice) {
        return Promise.reject('Must use physical device for Push Notifications');
    }

    try {
        return Notifications.getPermissionsAsync()
            .then(async (statusResult) => {
                return Notifications.getExpoPushTokenAsync(appNameAndSlug)
            })
            .then((tokenData) => tokenData.data);
    } catch (error) {
        console.log(error)
        return Promise.reject("Couldn't check notifications permissions");
    }
};

const auth0ClientId = GlobalData.constData.b2cClientId;
const tokenEndpoint = GlobalData.constData.tokenEndPoint;

// create a component
const SignUpScreen = props => {
    async function saveUserInformationToLocalStorage
        (key, value) {
        await SecureStore.setItemAsync(key, value);
    }
    LogBox.ignoreLogs(['Warning: ...']);
    LogBox.ignoreAllLogs();
    var token = global.globalVar
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isNewUser, setNewUser] = useState(false)
    const [registeredphoneNumber, setRegisteredphoneNumber] = useState()
    const sound = React.useRef(new Audio.Sound());
    const [welcomeText, setWelcomeText] = useState(true);
    const [userInformation, setUserInformation] = useState()
    const [ieltsInformation, setIeltsInformation] = useState()
    const [goalId, setGoalId] = useState()
    const [b2ccToken, setB2cToken] = useState()
    const registerationSuccess = props.navigation.getParam('registerationSuccess')
    const [shouldUpdate, setshouldUpdate] = useState(false)
    LogBox.ignoredYellowBox = ['Setting a timer'];
    const shoudPlayWelcomeSound = props.navigation.getParam('shoudPlayWelcomeSound')

    const MarkNotificationAsRead = async (notificationId) => {
        const markNotificationAsReadUrl = GlobalData.constData.apiUrl + GlobalData.constData.markPushNotificationAsRead + notificationId;
        const response = await fetch(markNotificationAsReadUrl,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
        const json_data = await response.json();
    }

    useEffect(() => {
        getPushToken().then((pushToken) => {
            setExpoPushToken(pushToken);
            if (pushToken) {
                (pushToken, setIsSubscribed);
            }
        });
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            try {
                if (Platform.OS === 'android') {
                    console.log('notificationlistener',)
                    setNotification(notification.request.trigger.remoteMessage.data.body);
                }
                if (Platform.OS === 'ios') {
                    console.log('ios notificationlistener')
                    setNotification(notification.request.content.data.practiceId);
                }
            } catch (error) {
                console.log(error);
            }
        }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                try {
                    if (Platform.OS === 'android') {
                        console.log(response)
                        setNotification(response.notification.request.trigger.remoteMessage.data.body);
                        const pushNotificationBody = response.notification.request.trigger.remoteMessage.data.body
                        const obj = JSON.parse(pushNotificationBody);
                        MarkNotificationAsRead(obj.PushNotificationId)
                        props.navigation.navigate(GlobalData.constData.testBandScoreRoute, { testIsReviewed: obj.IsPracticeTestFinalized, applicantId: userInformation.userInfo.id, instituteId: userInformation.userInfo.instituteId, itemId: obj.practiceId, throughUserDashBoard: true, route: global.globalRoute, practiceTitle: obj.PracticeTitle });
                    }
                    if (Platform.OS === 'ios') {
                        console.log('iosresponselister')
                        setNotification(response.notification.request.content.data.practiceId);
                        var iositemId = response.notification.request.content.data.practiceId
                        var PracticeTitle = response.notification.request.content.data.PracticeTitle
                        var IsPracticeTestFinalized = response.notification.request.content.data.IsPracticeTestFinalized
                        var notificationId = response.notification.request.content.data.PushNotificationId
                        MarkNotificationAsRead(notificationId)
                        props.navigation.navigate(GlobalData.constData.testBandScoreRoute, { testIsReviewed: IsPracticeTestFinalized, applicantId: userInformation.userInfo.id, instituteId: userInformation.userInfo.instituteId, itemId: iositemId, throughUserDashBoard: true, route: global.globalRoute, practiceTitle: PracticeTitle, });
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        );
        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    });

    const LoadAudio = async () => {
        try {
            const result = await sound.current.loadAsync(
                require("../assets/Welcome-to-LIAH.mp3")
            );
            if (result.isLoaded === false && !user.jwtToken) {
            } else {
                PlayAudio();
            }
            sound.current.setOnPlaybackStatusUpdate((playbackStatus) => { });
        } catch (error) {
            console.log(error);
        }
    };
    const PlayAudio = async () => {
        try {
            const result = await sound.current.getStatusAsync();
            if (result.isLoaded && shoudPlayWelcomeSound === undefined) {
                if (result.isPlaying === false) {
                    sound.current.playAsync();
                }
                if (result.isPlaying === true) {
                    sound.current.playAsync();
                }
            } else {
                LoadAudio();
            }
        } catch (error) {
            console.log(error)
        }
    };

    var isAuthReady = false;
    LogBox.ignoreLogs(['Warning: ...']);
    LogBox.ignoreAllLogs();
    let redirectUrl = Linking.createURL(GlobalData.constData.expoCreatUrl);
    const discovery = useAutoDiscovery(GlobalData.constData.b2cDiscovery);
    const [user, setUser] = useState({});
    const [expired, setExpired] = useState(false)
    const { getItem: getCachedToken, setItem: setToken } = useAsyncStorage('jwtToken')
    const [request, result, promptAsync] = AuthSession.useAuthRequest(
        {
            redirectUri: redirectUrl,
            clientId: GlobalData.constData.b2cClientId,
            // clientSecret: 'eF88Q~0-ZNcbkvtl1rfFKziUCQQeboXmIjDBSarJ',
            responseType: GlobalData.constData.responseType,
            scopes: [GlobalData.constData.b2cScopes[0], GlobalData.constData.b2cScopes[1], GlobalData.constData.b2cScopes[2], GlobalData.constData.b2cScopes[3], GlobalData.constData.b2cScopes[4]],
            extraParams: {
                access_type: "offline"
            },
        }, discovery
    );

    const DateTime = (date) => {
        let tempDate = new Date(date)
        let monthNumber = tempDate.getMonth()
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let fDate = monthNames[monthNumber] + ' ' + tempDate.getDate() + ' ' + tempDate.getFullYear()
        if (fDate === "Jan 1 1900") {
            fDate = "Not Provided"
        }
        return fDate
    }

    const logout = async () => {
        const logoutUrls = GlobalData.constData.apiUrl + GlobalData.constData.signout + b2cToken;
        try {
            global.audioPlay = false;
            var logoutUrl;
            logoutUrl = await WebBrowser.openAuthSessionAsync(`${GlobalData.constData.b2cLogoutUri}?post_logout_redirect_uri=${redirectUrl}`)
            if (logoutUrl.type !== 'cancel') {
                props.navigation.replace('logoutSuccess', { load: true })
                setToken('')
                saveUserInformationToLocalStorage('jwtToken', '')
                saveUserInformationToLocalStorage('decoded', '')
                const response = await fetch(logoutUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                const json_data = await response.json();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const fetchUserInfo = async (decoded) => {
        try {
            if (user.decoded) {
                const decodedJwt = jwtDecode(user.jwtToken);
                if (decodedJwt.exp * 1000 < Date.now()) {
                    setUser({})
                    setToken('')
                    setExpired(true)
                    logout()

                }
                else {
                    global.globalVar = user.jwtToken;
                    global.b2CToken = decoded.sub
                    if (!userInformation) {
                        const response = await fetch(
                            GlobalData.constData.apiUrl + GlobalData.constData.userInformation + decoded.sub + '&deviceId=' + expoPushToken,
                            {
                                headers: {
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        )

                        const json_data = await response.json();
                        saveUserInformationToLocalStorage('userInformation', JSON.stringify(json_data))
                        saveUserInformationToLocalStorage('ieltsInformation', JSON.stringify(json_data.ieltsInformation))
                        saveUserInformationToLocalStorage('goalId', JSON.stringify(json_data.userInfo.appUsingGoalId))
                        let userInfo = await SecureStore.getItemAsync('userInformation')
                        let ieltsInformation = await SecureStore.getItemAsync('ieltsInformation')
                        let goalId = await SecureStore.getItemAsync('goalId')
                        setGoalId(goalId)
                        setIeltsInformation(JSON.parse(ieltsInformation))
                        setUserInformation(JSON.parse(userInfo))
                        if (json_data.ieltsInformation !== null) {
                            let date = json_data.ieltsInformation.ieltsExamDate
                            let dateTime = DateTime(date)
                            saveUserInformationToLocalStorage('dateText', dateTime)
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error, "signup screen");
            const errors =
                firebaseobj.database().ref("errors");
            errors.push({
                error: error,
                file: 'signupscreen.js'
            });
            setErrorHandler({
                cb: errors,
            })
        }
    };
    var [permissionMic, setPermissionMic] = useState({})
    var [permissionNotification, setPermissionNotification] = useState({})
    const setPermissions = async () => {
        const PermissionMic = await Audio.getPermissionsAsync();
        const PermissionNotification = await Notifications.getPermissionsAsync();
        setPermissionMic(PermissionMic)
        setPermissionNotification(PermissionNotification)
    }

    useEffect(() => {
        setPermissions()
        readTokenFromStorage()

        if (result) {
            if (result.error) {
                Alert.alert(
                    'Authentication error',
                    result.params.error_description || 'something went wrong'
                );
                return;
            }
            if (result.type === 'success') {
                const decoded = jwtDecode(result.params.id_token)
                let phoneNumber = decoded["signinnames.phoneNumber"]
                let b2cToken = decoded.sub
                const code = result.params.code;
                if (code && decoded["signinnames.phoneNumber"] !== decoded.name) {

                    const getToken = async () => {
                        const codeRes = await AuthSession.exchangeCodeAsync(
                            {
                                code: result.params.code,
                                redirectUri: redirectUrl,
                                clientId: GlobalData.constData.b2cClientId,
                                extraParams: {
                                    code_verifier: request?.codeVerifier || ""
                                },

                            }, discovery

                        )
                        const tokenConfig = codeRes?.getRequestConfig();
                        const jwtToken = tokenConfig.accessToken;
                        setRegisteredphoneNumber(phoneNumber)
                        setExpoPushToken(expoPushToken)
                        setB2cToken(b2cToken)
                        setNewUser(false)
                        setToken(JSON.stringify(tokenConfig));
                        const decoded = jwtDecode(jwtToken);
                        setUser({ jwtToken, decoded })
                    }
                    getToken()
                }
                else {
                    setRegisteredphoneNumber(phoneNumber)
                    setExpoPushToken(expoPushToken)
                    setB2cToken(b2cToken)
                    setNewUser(true)
                }
            }
        }
    }, [result, notification, userInformation, shouldUpdate, isNewUser])
    useEffect(() => {
        fetchUserInfo(user.decoded)
        setTimeout(() => setWelcomeText(false), 4000)
    }, [result, notification, userInformation, user, registeredphoneNumber, isNewUser])
    const Continue = async () => {
        promptAsync()
    }
    const readTokenFromStorage = async () => {
        const tokenString = await getCachedToken();
        const tokenConfig = JSON.parse(tokenString);
        if (tokenConfig) {
            let tokenResponse = new TokenResponse(tokenConfig);
            if (tokenResponse.shouldRefresh()) {
                const refreshConfig = { clientId: GlobalData.constData.b2cClientId, refreshToken: tokenConfig.refreshToken }
                const endpointConfig = { tokenEndpoint }
                tokenResponse = await tokenResponse.refreshAsync(refreshConfig, endpointConfig);
            }
            setToken(JSON.stringify(tokenResponse.getRequestConfig()));
            const decoded = jwtDecode(tokenResponse.idToken);
            setUser({ jwtToken: tokenResponse.accessToken, decoded })
            setExpoPushToken(expoPushToken)
            setB2cToken(decoded.sub)
            setRegisteredphoneNumber(decoded["signinnames.phoneNumber"])
        }
    };
    const ShowLoader = () => {
        return (
            <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1, height: '100%' }}>
                <StatusBar backgroundColor={Colors.colorCodes.transparent} translucent style="dark" />
                <StatusBar backgroundColor={Colors.colorCodes.transparent} translucent style="dark" />
                <ImageBackground style={styles.bgImage} source={GlobalData.constData.BackGroundImage}>
                    <View style={[styles.loadingContainer, styles.horizontal]}>
                        <DotIndicator color={Colors.colorCodes.orange} size={10} />
                    </View>
                </ImageBackground>
            </KeyboardAwareScrollView>
        )
    }
    const ShowWelcomeText = (props) => {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <StatusBar backgroundColor={Colors.colorCodes.transparent} translucent style="dark" />
                <View
                    contentContainerStyle={{
                        flexGrow: 1,
                        height: "100%",
                        marginBottom: "30%",
                    }}
                >
                    <ImageBackground
                        style={styles.bgImage}
                        resizeMode="stretch"
                        source={GlobalData.constData.BackGroundImage}
                    >
                        {props.showContinueButton === true ? (
                            <View style={styles.imageContainer}>
                                <View style={{ width: '45%', height: '45%', justifyContent: "center", alignItems: 'center' }}>
                                    <Image
                                        style={styles.image} resizeMode="contain"
                                        source={GlobalData.constData.logoPath}
                                    />
                                </View>
                                <View style={styles.headingContainer}>
                                    <View style={{ width: '90%' }}>
                                        <Text style={{
                                            fontFamily: FontFamilies.fontFamilies.montserratSemiBold,
                                            color: Colors.colorCodes.black, fontSize: 20, textAlign: 'center'
                                        }}>Please click here to continue</Text>
                                    </View>
                                </View>
                                <View style={styles.buttonView}>
                                    <TouchableOpacity activeOpacity={0.6} style={styles.button} onPress={Continue

                                    } >
                                        <View style={styles.buttonBorder}>
                                            <Text style={styles.buttonText} >Continue</Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        ) : (<View style={styles.imageContainer}>
                            <View style={styles.indicatorView}>
                                <View
                                    style={{ justifyContent: "center", alignItems: "center" }}
                                >
                                    {global.ShowText === true && welcomeText && shoudPlayWelcomeSound === undefined && (
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: 28,
                                                    fontFamily: FontFamilies.fontFamilies.montserratBold,
                                                }}
                                            >
                                                Welcome To LIAH
                                            </Text>
                                        </View>
                                    )}
                                    <View style={{ marginTop: "10%", height: "10%" }}>
                                        <DotIndicator color={Colors.colorCodes.orange} size={10} />
                                    </View>
                                </View>
                                {props.shouldAskForLogin === true && (
                                    <View activeOpacity={0} style={{ height: 0, width: 0 }}>
                                        <CountDown
                                            digitStyle={{
                                                borderWidth: 0,
                                                fontFamily: FontFamilies.fontFamilies.montserratBold,
                                            }}
                                            digitTxtStyle={{ color: Colors.colorCodes.white }}
                                            until={3}
                                            timeToShow={["S"]}
                                            timeLabels={{ s: "" }}
                                            size={0}
                                            width={0}
                                            onFinish={() => {
                                                [
                                                    promptAsync(),
                                                    setWelcomeText(false),
                                                    (global.ShowText = false),
                                                    sound.current.unloadAsync(),
                                                ];
                                            }}
                                        />
                                    </View>
                                )}

                            </View>

                        </View>)}

                    </ImageBackground>
                </View>
            </View>
        )
    }

    if (user.jwtToken || isNewUser == true) {
        isAuthReady = true;
        if (permissionMic.granted === true) {
            if (isNewUser === true && welcomeText === false) {
                return (
                    <UserRegisteration navigation={props.navigation} registeredphoneNumber={registeredphoneNumber} expoPushToken={expoPushToken} b2cToken={b2ccToken} />
                )
            }

            else if (!userInformation) {
                return (
                    <ShowWelcomeText />
                )
            }
            else if (((userInformation.userInfo === null || userInformation.userInfo.appUsingGoalId === 0 || goalId === 0))) {
                return (
                    <SetAppGoalScreen navigation={props.navigation} userInformation={userInformation} ieltsInformation={ieltsInformation} goalId={goalId} />
                )
            }
            else if ((ieltsInformation === null || ieltsInformation.isExamBooked === false)) {
                return (
                    <UserDashboard navigation={props.navigation} />
                )
            }

            else if (ieltsInformation.isExamBooked === true) {
                return (
                    <ModuleSelectionScreen navigation={props.navigation} />
                )
            }
        }
        else if (permissionMic.granted === undefined) {
            return (
                <ShowLoader />
            )
        }
        else if (isNewUser === true && welcomeText === false && !registerationSuccess) {
            return (
                <UserRegisteration navigation={props.navigation} registeredphoneNumber={registeredphoneNumber} expoPushToken={expoPushToken} b2cToken={b2ccToken} />
            )
        }
        else {
            if (userInformation) {
                return (
                    <Permissions navigation={props.navigation} userInformation={userInformation} ieltsInformation={ieltsInformation} goalId={goalId} />
                )
            }
            else {
                return (
                    <ShowWelcomeText showContinueButton={false} shouldAskForLogin={false} />
                )
            }
        }
    }
    else if (!user.jwtToken && (result === null || result.type == 'error') && !userInformation) {
        Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        if (welcomeText === true) {
            LoadAudio();
        }
        return (
            <ShowWelcomeText showContinueButton={false} shouldAskForLogin={true} />
        )
    }
    if (!isAuthReady && result.type !== 'success') {
        return (
            <ShowWelcomeText showContinueButton={true} shouldAskForLogin={true} />
        );
    }
    else {
        return (
            <ShowLoader />
        )
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1
    },
    bgImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '50%',
        marginBottom: '30%',
        alignItems: 'center',
        marginTop: '10%'
    },
    formControl: {
        width: '90%',
        height: '100%',
        marginTop: Platform.OS === 'ios' ? '20%' : '30%'
    },
    backIcon: {
        marginBottom: 15
    },
    headingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: '5%',
        marginBottom: '5%'
    },
    heading: {
        marginTop: 0,
        fontSize: 20,
        textAlign: 'left',
        fontFamily: FontFamilies.fontFamilies.montserratBold,
        marginBottom: 10,
        color: Colors.colorCodes.black
    },
    subHeading: {
        fontSize: 12,
        color: Colors.colorCodes.grey,
        marginBottom: 10,
        fontFamily: FontFamilies.fontFamilies.montserrat,
        marginBottom: 15
    },
    buttonView: {
        width: '70%',
        height: '15%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: '80%',
        width: '70%',
        backgroundColor: Colors.colorCodes.green
    },
    buttonText: {
        fontWeight: '500',
        textAlign: 'center',
        color: Colors.colorCodes.white,
        fontSize: 20,
        fontFamily: FontFamilies.fontFamilies.montserrat
    },
    indicatorView: {
        height: '15%',
        marginTop: '5%',
        alignItems: 'center',
        justifyContent: 'center',
    }, loadingContainer: {
        flex: 1,
        justifyContent: "center"
    },
    horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    },
});

//make this component available to the app
export default SignUpScreen;