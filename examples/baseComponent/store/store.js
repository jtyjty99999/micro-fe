import { createStore } from 'redux';

const initialState = {
    count: 0,
    index:-1
};

function reducer(state = initialState, action) {
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
             return {
                index:action.value
            };
        default:
            return state;
    }
}
export const storeInstance = createStore(reducer);