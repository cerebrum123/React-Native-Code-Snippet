import { SET_USER_EMAIL } from "../actions/LoginAction";


const initialState = {
    email: '',
    username: '',
    token: [],
    user_id: [],

};


function userReducer(state = initialState, action) {
    switch (action.type) {

        case SET_USER_EMAIL:
            return { ...state, email: action.payload };
        case SET_TOKEN:
            return { ...state, token: action.payload };
        case SET_USER_ID:
            return { ...state, user_id: action.payload };
        default:
            return state;
    }
}
export default userReducer;
