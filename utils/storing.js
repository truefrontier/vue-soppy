import routesJSON from '@/router/routes.json';
import { clone } from './object';

export const soppyState = (routesJSON) => {
  let state = {
    preloadState: {},
  };

  routesJSON.forEach((route) => {
    if (route.path.indexOf(':') === -1) state.preloadState[route.path] = {};
  });

  return state;
};

export const soppyActions = {
  setSoppyState({ commit }, data) {
    commit('setSoppyState', data);
  },

  setSoppyPreloadState({ commit }, data) {
    commit('setSoppyPreloadState', data);
  },
};

export const soppyMutations = {
  setSoppyState(state, { data }) {
    if (data && Object.keys(data).length) {
      Object.keys(data).forEach((key) => {
        state[key] = data[key];
      });
    }
  },

  setSoppyPreloadState(state, { path, data }) {
    if (data && Object.keys(data).length) {
      if (!state.preloadState[path]) state.preloadState[path] = {};
      Object.keys(data).forEach((key) => {
        state.preloadState[path][key] = data[key];
      });
    }
  },
};
