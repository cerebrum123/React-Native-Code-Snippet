import axios from 'axios';
import { APIS, URLs } from '../../utility/URLs';

export const SET_USER_EMAIL = 'SET_USER_EMAIL';
export const SET_USER_PASSWORD = 'SET_USER_PASSWORD';
export const SET_USER_SIGNUP = 'SET_USER_SIGNUP';

export const setEmail = email => dispatch => {
  dispatch({
    type: SET_USER_EMAIL,
    payload: email,
  });
};

export const setPassword = password => dispatch => {
  dispatch({
    type: SET_USER_PASSWORD,
    payload: password,
  });
};

export const SignupAction = (payload, callback) => {
  var request = APIS.post(
    URLs.SignUp,
    JSON.stringify({
      email_phone: payload.email,
      password: payload.password,
    }),
    {
      headers: {

        'Content-Type': 'application/json',

      },
    },
  )
    .then(response => {
      callback(response);
      console.log("Login Response", response)
    })
    .catch(error => {
      console.log('sign up eror', error.response);
      if (error.response) callback(error.response);
      else callback(error);
    })
};
