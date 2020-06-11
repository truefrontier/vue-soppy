import { clone } from '../../utils/object';
import axios from 'axios';
axios.defaults.headers.common['Content-Type'] = 'application/json';
import SoppyBus from '../../utils/bus';

// -- STATE -- //

const state = {
  isGetting: [],
  isPosting: [],
  isPreloading: [],
};

// -- GETTERS -- //

const getters = {};

// -- ACTIONS -- //

const actions = {
  postData({ commit, dispatch, rootState }, { path, postData }) {
    commit('addPosting', path);
    if (!path) path = window.location.href;

    return axios
      .post(path, postData)
      .then(({ data }) => {
        dispatch('setSoppyState', { data }, { root: true });
        if (data.to) SoppyBus.$emit('redirect', { name: data.to });
        return data;
      })
      .catch((err) => {
        if (err?.response?.status === 401) SoppyBus.$emit('unauthorized');
      })
      .finally(() => {
        commit('removePosting', path);
      });
  },

  getData({ commit, dispatch, rootState }, { path, force = true }) {
    if (
      !force &&
      rootState.preloadState.hasOwnProperty(path) &&
      Object.keys(rootState.preloadState[path]).length
    ) {
      let data = rootState.preloadState[path];
      return dispatch('setSoppyState', { data }, { root: true });
    }

    commit('addGetting', path);
    return axios
      .get(path)
      .then(({ data }) => {
        dispatch('setSoppyState', { data }, { root: true });
        if (data.to) SoppyBus.$emit('redirect', { name: data.to });
        return data;
      })
      .catch((err) => {
        if (err?.response?.status === 401) SoppyBus.$emit('unauthorized');
      })
      .finally(() => {
        commit('removeGetting', path);
      });
  },

  preloadData({ commit, dispatch, rootState }, { path, force = true }) {
    if (
      !force &&
      rootState.preloadState.hasOwnProperty(path) &&
      Object.keys(rootState.preloadState[path]).length
    ) {
      let data = rootState.preloadState[path];
      return dispatch(`setSoppyPreloadState`, { path, data }, { root: true });
    }

    commit('addPreloading', path);
    return axios
      .get(path)
      .then(({ data }) => {
        dispatch(`setSoppyPreloadState`, { path, data }, { root: true });
        return data;
      })
      .catch((err) => {
        if (err?.response?.status === 401) SoppyBus.$emit('unauthorized');
      })
      .finally(() => {
        commit('removePreloading', path);
      });
  },
};

// -- MUTATIONS -- //

const mutations = {
  addGetting(state, getting) {
    let isGetting = clone(state.isGetting, []);
    isGetting.push(getting);
    state.isGetting = [...new Set(isGetting)];
  },

  removeGetting(state, getting) {
    let isGetting = clone(state.isGetting, []);
    const index = isGetting.indexOf(getting);
    if (index !== -1) {
      isGetting.splice(index, 1);
      state.isGetting = isGetting;
    }
  },

  addPosting(state, posting) {
    let isPosting = clone(state.isPosting, []);
    isPosting.push(posting);
    state.isPosting = [...new Set(isPosting)];
  },

  removePosting(state, posting) {
    let isPosting = clone(state.isPosting, []);
    const index = isPosting.indexOf(posting);
    if (index !== -1) {
      isPosting.splice(index, 1);
      state.isPosting = isPosting;
    }
  },

  addPreloading(state, preloading) {
    let isPreloading = clone(state.isPreloading, []);
    isPreloading.push(preloading);
    state.isPreloading = [...new Set(isPreloading)];
  },

  removePreloading(state, preloading) {
    let isPreloading = clone(state.isPreloading, []);
    const index = isPreloading.indexOf(preloading);
    if (index !== -1) {
      isPreloading.splice(index, 1);
      state.isPreloading = isPreloading;
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true,
};
