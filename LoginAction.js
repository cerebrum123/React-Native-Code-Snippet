import AsyncStorage from '@react-native-async-storage/async-storage';
import { APIS, URLs } from '../../utility/URLs';
import { Platform } from 'react-native';

export const LoginAction = async (payload, callback) => {
  const deviceId = await AsyncStorage.getItem('fcmToken');
  console.log('FcmToken', deviceId, payload);

  APIS.post(
    URLs.Login,
    JSON.stringify({
      email_phone: payload.email,
      password: payload.password,
      device_type: Platform.OS === 'ios' ? 2 : 1,
      device_id: deviceId,
    }),
    {
      headers: {
        'content-type': 'application/json',
        // 'Authorization': 'Bearer ' + fcmToken,
      },
    },
  )
    .then(response => {
      console.log("login", response);
      callback(response);
    })
    .catch(error => {
      if (error.response) {
        console.log('login before Error=>', error)
        callback(error.response);
        console.warn("login error==>", error.response.data);
      } else {
        callback(error);
        console.warn("login error", error);
      }
    })
};
