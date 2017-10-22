import {
    EMAIL_CHANGED,
    PASSWORD_CHANGED,
    VALID_EMAIL_PASSWORD,
    NOT_VALID_EMAIL_PASSWORD,
    LOGIN_SUCCESS,
    NO_CONNECTION
} from '../actions/authentication/auth_types'

const INITIAL_STATE = {
    email:'',
    password:'',
    error: '',
    loading: false,
    token:''
};

export default (state=INITIAL_STATE, action)=>{
    // main debug
    console.log(action);

    switch(action.type){
        case EMAIL_CHANGED: {
            return {...state, email: action.payload};
        }
        case PASSWORD_CHANGED: {
            return { ... state, password: action.payload}
        }
        case VALID_EMAIL_PASSWORD: {
            return { ... state, error:''}
        }
        case NOT_VALID_EMAIL_PASSWORD:{
            return { ... state, error:'Email or Password not valid'}
        }
        //TODO: token store
        case LOGIN_SUCCESS: {
            return { ... state, password: '', error:'', token: action.payload }
        }
        case NO_CONNECTION: {
            return { INITIAL_STATE, error:'Server out of service'}
        }
        default:
            return state;
    }
};