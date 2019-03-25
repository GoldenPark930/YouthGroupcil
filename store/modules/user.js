import axios from 'axios'
// initial state
// shape: [{ id, quantity }]
const state = {
    current_user: null,
}

// getters
const getters = {
    currentUser: (state, getters, rootState) => {
        return state.current_user;
    }
}

// actions
const actions = {
    loadAuthUser({dispatch, state, commit}, options = {}) {
        const {withScope = []} = options;
        let params = {};
        
        // if (Array.isArray(withScope) && withScope.length) {
        //     params.with = withScope.join(',')
        // }

        return axios
            .get('/api/client', {
                params: params
            })
            .then(r => r.data)
            .then(user => {
                commit('setCurrentUser', user)
                return user;
            })
    },
}

// mutations
const mutations = {
    setCurrentUser(state, user) {
        state.current_user = user
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}