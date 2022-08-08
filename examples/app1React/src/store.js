import { createStore } from 'redux';

const initialState = {
    count: 0,
    index:-1
};

function reducer(state = initialState, action) {
    console.log(action);
    switch(action.type) {
        case 'INCREMENT':
            return {
                count: state.count + 1,
                index: state.index
            };
        case 'DECREMENT':
            return {
                count: state.count - 1,
                index: state.index
            };
        case 'CHANGE':
            console.log(333);
            return {
               index:action.value
           };
        default:
            return state;
    }
}

export default createStore(reducer);
//export const storeInstance = createStore(reducer); //***** 接入到主应用写法