import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Keyboard,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { GoogleSignin } from '@react-native-community/google-signin';
import { InputFeild } from '../../Components/InputField';
import { PrimaryButton } from '../../Components/PrimaryButton';
import { RoundButton } from '../../Components/RoundButton';
import { AuthHeader } from '../../Components/AuthHeader';
import IMAGE_PATHS from '../../../../utility/ImagePaths';
import COLORS from '../../../../theme/Colors';
import { LoginAction } from '../../../../Redux-THUNK/actions/LoginAction';
import GLOBAL_STRINGS from '../../../../utility/Strings';
import CheckBox from '../../Components/CheckBox';
import Icon from 'react-native-vector-icons/Entypo';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { FONT_NAME } from '../../../../utility/FontName';
import { FONT_SIZE } from '../../../../utility/FontSize';
import Snackbar from 'react-native-snackbar';
import { useDispatch } from 'react-redux';
import GoogleSignIn from '../GoogleSignIn';
Icon.loadFont();
import {
  setLoading,
  setToken,
  setIsLoggedIn,
  setUser,
  setUser_id,
} from '../../../../Redux-THUNK/reducers/AuthenticationReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Autocomplete from 'react-native-autocomplete-input';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { Spacer } from '../../Components/Spacer';
import {
  emailPhoneValidateAction,
  formatPhoneNumber,
  passwordValidateAction,
} from '../../../../Redux-THUNK/actions/ValidationAction';
const { width } = Dimensions.get('window');
const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [emailFormatted, setEmailFormatted] = useState('');

  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [check, setCheck] = useState(false);
  const [storeData, setStoredata] = useState([]);
  const [list, setList] = useState();
  const [hideResult, setHideResult] = useState(false);

  useEffect(() => {
    DispatchData();
  }, []);

  useEffect(() => { }, [check]);

  useEffect(() => {
    GoogleSignin.configure({
      androidClientId:
        '967886857198-4ghj1nmes1eno1tv2s79nti03d17vnvh.apps.googleusercontent.com',
      iosClientId:
        '967886857198-gdvr5jjcmss5q046v1rh33gtpv05hm61.apps.googleusercontent.com',
    });
  }, []);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const DispatchData = async () => {
    try {
      var savedString = await AsyncStorage.getItem('SavedUsers');
      const getData = JSON.parse(savedString);
      if (getData) setStoredata(getData);
    } catch (err) {
      console.log(err);
    }
  };

  const removeData = index => {
    let tempArray = [...storeData];
    if (tempArray.length == 1) {
      tempArray.splice(0, 1);
      // console.log('if');
      AsyncStorage.setItem('SavedUsers', '');
    } else {
      tempArray.splice(index, 1);
      AsyncStorage.setItem('SavedUsers', JSON.stringify(tempArray));
    }
    setStoredata(tempArray);
  };

  const SetData = () => {
    let tempArray = [...storeData];
    var found = tempArray.find(e => e.email == email);

    if (found) {
    } else {
      tempArray.push({ email: emailFormatted, password: password });
    }
    const output = JSON.stringify(tempArray);

    try {
      AsyncStorage.setItem('SavedUsers', output);
      setStoredata(tempArray);
    } catch (error) { }
  };

  const AppSignin = async () => {
    console.log("Apple Signup", Platform.OS)
    if (Platform.OS == 'ios')
      try {
        const AuthtResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
      } catch (error) {
        console.log(error);
      }
    else {
      Alert.alert("Apple signup is not supported on this platform")
    }
  };

  const showSnackbar = message => {
    setTimeout(() => {
      Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_LONG,
      });
    }, 100)
  };

  const onLoginSucess = response => {
    dispatch(setLoading(true));
    if (response.status && response.status == 200) {
      dispatch(setToken(response.data.data));

      AsyncStorage.setItem('isLoggedInSocial', 'GOOGLE');
      dispatch(setIsLoggedIn(true));
    } else if (response.data && response.data.message) {
      showSnackbar(response.data.message);
    } else {
      showSnackbar(GLOBAL_STRINGS.SomethingWentWrong);
    }
    dispatch(setLoading(false));
  };

  const LoginApi = () => {
    let EmailValidator = emailPhoneValidateAction(email);
    let passwordValidator = passwordValidateAction(password);

    if (EmailValidator) {
      showSnackbar('Please enter valid email or phone');
    } else if (passwordValidator) {
      showSnackbar('Please enter valid password');
    }

    dispatch(setLoading(true));

    LoginAction(
      {
        email: emailFormatted.toLowerCase(),
        password: password,
      },
      response => {
        if (response) {
          if (response.status && response.status == '200') {
            if (check && storeData) SetData();
            try {
              AsyncStorage.setItem('isLoggedIn', 'YES');
              AsyncStorage.setItem(
                'CurrentLoggedUser',
                JSON.stringify({
                  user_id: response.data.data.userData._id,
                  password: password,
                  email: response.data.data.userData.email,
                  phone_number: response.data.data.userData.phone_number,
                }),
              );
            } catch (error) {
              console.log(error);
            }

            dispatch(setIsLoggedIn(true));
            dispatch(
              setUser({
                user_id: response.data.data.userData._id,
                password: password,
                email: response.data.data.userData.email,
                phone_number: response.data.data.userData.phone_number,
              }),
            );
            dispatch(setToken(response.data.data.token));
          } else if (response.status && response.status == '409') {

            console.warn("User id is coming -->> ", response.data.data)
            dispatch(
              setUser_id(response.data.data),
            );
            navigation.navigate('ValidationScreen', {
              IscomingfromSignup: true,
              UserData: { email: emailFormatted.toLowerCase(), password: password },
              user_id: response.data.data
            });

          } else if (response.data && response.data.message) {
            setTimeout(() => {
              Snackbar.show({
                text: response.data.message,
                duration: Snackbar.LENGTH_LONG,
              });
            }, 100)
          } else {
            setTimeout(() => {
              Snackbar.show({
                text: response.message,
                duration: Snackbar.LENGTH_LONG,
              });
            }, 100)
          }
        } else {
          setTimeout(() => {
            Snackbar.show({
              text: GLOBAL_STRINGS.SomethingWentWrong,
              duration: Snackbar.LENGTH_LONG,
            });
          }, 100)
        }
        dispatch(setLoading(false));
      },
    );
  };


  return (
    <ScrollView>
      <ImageBackground
        style={{
          width: width,
          height: height,
        }}
        resizeMode={'stretch'}
        source={IMAGE_PATHS.LoginBG}>
        <View
          style={{ height: '30%', backgroundColor: 'transparent' }}
          onStartShouldSetResponder={() => {
            Keyboard.dismiss();
            setHideResult(true);
          }}></View>

        <View
          style={{
            backgroundColor: COLORS.White,
            marginHorizontal: widthPercentageToDP(3.5),
            justifyContent: 'center',
            height: heightPercentageToDP(66.5),
            marginVertical: heightPercentageToDP(0.5),
            // paddingHorizontal: widthPercentageToDP(3)
            padding: widthPercentageToDP(5)
          }}>
          <View
            style={{
              // paddingHorizontal: widthPercentageToDP(3),
            }}>
            <Spacer space={1.5} />
            <AuthHeader onPress={() => navigation.goBack()} />
            <Spacer space={0.5} />
            <View style={styles.headerTextView}>
              <Text style={styles.headerTextStyle}>
                {GLOBAL_STRINGS.LoginHeaderText}
              </Text>
              <Text style={styles.headerTextStyle2}>
                {GLOBAL_STRINGS.LoginHeaderText2}
              </Text>
            </View>
            <Spacer space={0.5} />
            <View
              style={{
                width: "100%",
                alignSelf: 'center',
                justifyContent: 'space-evenly',
              }}>
              <View
                style={{
                  height: heightPercentageToDP(7),
                  zIndex: 50,
                }}>
                <Autocomplete
                  hideResults={hideResult}
                  renderTextInput={() => (
                    <InputFeild
                      label={GLOBAL_STRINGS.Email_PhoneText}
                      value={email}
                      onChangeText={value => {
                        let val = value.replace(/ /g, '');
                        setEmailError(emailPhoneValidateAction(val));
                        // if (emailPhoneValidateAction(val) == '')
                        let emailObj = formatPhoneNumber(val);
                        if (emailObj.formatted) {
                          setEmail(emailObj.formatted)
                        } else {
                          setEmail(val);
                        }
                        setEmailFormatted(emailObj.value)

                        //Add new state
                        setHideResult(false);
                      }}
                    />
                  )}
                  placeholderTextColor={COLORS.DarkGrey}
                  inputContainerStyle={{
                    borderWidth: 0,
                  }}
                  data={
                    email.length > 1
                      ? storeData.filter(e => e.email.includes(email))
                      : []
                  }
                  value={formatPhoneNumber(email).formatted}
                  placeholder={GLOBAL_STRINGS.Email_PhoneText}
                  listContainerStyle={{
                    backgroundColor: COLORS.White,
                    position: 'absolute',
                    maxHeight: 160,
                    marginTop: 50,
                    width: width * 0.84,
                  }}
                  flatListProps={{
                    keyboardShouldPersistTaps: 'always',
                    renderItem: ({ item, index }) => (
                      <TouchableOpacity
                        style={{
                          borderBottomWidth: 1,
                          width: '100%',
                          paddingHorizontal: 10,
                          flexDirection: 'row',
                        }}
                        onPress={() => {
                          setEmail(item.email);
                          setHideResult(true);
                          setPassword(item.password);
                          setEmailError('');
                          setPassError('');
                        }}>
                        <View
                          style={{
                            flexDirection: 'column',
                            width: '90%',
                          }}>
                          <Text style={styles.autoCompletetext}>
                            {item.email}
                          </Text>
                          <Text style={styles.autoCompletetext}>{'*******'}</Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '10%',
                          }}>
                          <Icon
                            name="cross"
                            size={24}
                            onPress={() => removeData(index)}
                            color={COLORS.Black}
                          />
                        </View>
                      </TouchableOpacity>
                    ),
                  }}
                />
              </View>


              {emailError.length > 0 && (
                <Text style={styles.errorMsg}>{emailError}</Text>
              )}
              <View
                style={{
                  height: heightPercentageToDP(10),
                  // backgroundColor: 'green'
                }}>
                <InputFeild
                  styles={{}}
                  label={GLOBAL_STRINGS.Password}
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    setPassError(passwordValidateAction(value));
                  }}
                  secureTextEntry
                />
                <View
                  style={{
                    minHeight: heightPercentageToDP(3.5),
                    justifyContent: 'center'
                  }}
                >
                  {passError.length > 0 && (
                    <Text style={styles.errorMsg}>{passError}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    zIndex: -1,
                    paddingRight: widthPercentageToDP(0),
                    padding: 2
                  }}
                  onPress={() => navigation.navigate('ResetPasswordScreen')}>
                  <Text style={styles.forgetpassword}>
                    {GLOBAL_STRINGS.ForgetPassword}
                  </Text>
                </TouchableOpacity>
              </View>
              <Spacer space={1} />
              <View style={styles.remeberMeView}>
                <CheckBox
                  onPress={() => setCheck(!check)}
                  isChecked={check}
                  disabled={false}
                  style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: -2,
                  }}
                />
                <Text style={styles.checkBoxText}>
                  {GLOBAL_STRINGS.RemeberMeText}
                </Text>
              </View>

            </View>
          </View>

          <View style={styles.PrimaryButtonView}>
            <Spacer space={1} />
            <PrimaryButton text={GLOBAL_STRINGS.Login}
              onPress={
                () => {
                  LoginApi()
                }
              } />
          </View>
          <View style={styles.loginUsingView}>
            <Text style={styles.loginUsingStyle}>
              {GLOBAL_STRINGS.SocialLogintext}
            </Text>
            <View style={styles.socialBtnView}>

              <RoundButton
                name={'apple1'}
                color={'white'}
                size={24}
                onPress={AppSignin}
              />
              <RoundButton
                name={'google'}
                color={'white'}
                size={24}
                onPress={() => GoogleSignIn(onLoginSucess, dispatch)}
              />
            </View>
            <View style={styles.createUserView}>
              <Text style={styles.createUserText}>
                {GLOBAL_STRINGS.DontHaveAccountText}
              </Text>

              <TouchableOpacity onPress={() => navigation.push('SignupScreen')}>
                <Text style={styles.createUserText2}>
                  {GLOBAL_STRINGS.CreateAccountText}
                </Text>
              </TouchableOpacity>


            </View>
            <Spacer space={0.2} />
          </View>
        </View>
      </ImageBackground>
    </ScrollView>

  );
};

export default LoginScreen;
const styles = StyleSheet.create({
  headerTextView: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  headerTextStyle: {
    fontSize: FONT_SIZE.Large,
    fontFamily: FONT_NAME.Brown,
    fontWeight: 'bold',
    color: COLORS.Black,
  },
  headerTextStyle2: {
    color: COLORS.Black,
    fontSize: FONT_SIZE.Large,

    marginLeft: 5,
    fontFamily: FONT_NAME.Brown,
  },
  inputview: {
    margin: 15,
  },
  forgetpassword: {
    textDecorationLine: 'underline',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.Black,
    color: COLORS.GreyishBlack,
    fontFamily: FONT_NAME.Brown,
    fontSize: FONT_SIZE.ExtraSmall,
  },

  loginUsingStyle: {
    fontSize: FONT_SIZE.Small,
    fontFamily: FONT_NAME.Brown,
    color: COLORS.Grey,
    padding: widthPercentageToDP(1),
  },
  loginUsingView: {
    justifyContent: 'space-around',
    alignItems: 'center',
    height: heightPercentageToDP(20),
  },
  socialBtnView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '65%',
    alignSelf: 'center',
  },
  createUserView: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingBottom: 2
  },
  createUserText: {
    fontSize: FONT_SIZE.Small,
    color: COLORS.Grey,
    fontFamily: FONT_NAME.Brown,
  },
  createUserText2: {
    fontSize: FONT_SIZE.Small,
    marginHorizontal: 2,
    textDecorationLine: 'underline',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.Black,
    color: COLORS.Grey,
    fontFamily: FONT_NAME.Brown,
  },
  Imageview: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorMsg: {
    color: COLORS.Red,
    // backgroundColor: 'green'
  },
  checkBoxText: {
    color: COLORS.Black,
    fontSize: FONT_SIZE.Small,
    fontFamily: FONT_NAME.Brown,
    zIndex: -2,
  },
  remeberMeView: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
    width: widthPercentageToDP(55),
    // backgroundColor: "red"
    // paddingTop: 4

  },
  autoCompletetext: {
    fontSize: FONT_SIZE.Small,
    fontFamily: FONT_NAME.Brown,
    color: COLORS.Black
  },
});
