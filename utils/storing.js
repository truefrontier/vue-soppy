import routesJSON from '@/router/routes.json';
import { clone } from './object';

let state = {
  preloadState: {},
};

routesJSON.forEach((route) => {
  state.preloadState[route.path] = {};
});

export const soggyState = state;

export const soggyActions = {
  setSoggyState({ commit }, data) {
    commit('setSoggyState', data);
  },

  setSoggyPreloadState({ commit }, data) {
    commit('setSoggyPreloadState', data);
  },
};

export const soggyMutations = {
  setSoggyState(state, { data }) {
    if (data && Object.keys(data).length) {
      Object.keys(data).forEach((key) => {
        state[key] = data[key];
      });
    }
  },

  setSoggyPreloadState(state, { path, data }) {
    if (data && Object.keys(data).length) {
      if (!state.preloadState[path]) state.preloadState[path] = {};
      Object.keys(data).forEach((key) => {
        state.preloadState[path][key] = data[key];
      });
    }
  },
};
