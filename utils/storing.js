import routesJSON from '@/router/routes.json';
import { clone } from './object';

let state = {
  preloadState: {},
};

routesJSON.forEach((route) => {
  state.preloadState[route.path] = {};
});

export const soppyState = state;

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
