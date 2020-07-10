import { clone, isString, isArray } from '../../utils/helpers';
import axios from 'axios';
axios.defaults.headers.common['Content-Type'] = 'application/json';
import SoppyBus from '../../utils/bus';

const isValidJSONResponse = (response) => {
  let { data, headers = {} } = response;
  // Test Data
  if (!data) return false;

  // Test Header
  let contentType = headers['content-type'] || headers['Content-Type'] || '';
  if (contentType.toLowerCase().indexOf('json') === -1) return false;

  return true;
};

const mergeWithState = (rootState, data) => {
  return Object.keys(data).reduce((obj, key) => {
    if (rootState.hasOwnProperty(key)) {
      obj[key] = Object.assign(clone(rootState[key]), data[key]);
    } else {
      obj[key] = data[key];
    }
    return obj;
  }, {});
};

// -- STATE -- //

const state = {
  isGetting: [],
  isPosting: [],
  isPreloading: [],
  preloadCancelSource: null,
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
      .then((response) => {
        if (isValidJSONResponse(response)) {
          let data = mergeWithState(rootState, response.data);
          dispatch('setSoppyState', { data }, { root: true });
          if (data.to) SoppyBus.$emit('redirect', { name: data.to });
        }
        return response;
      })
      .catch((err) => {
        if (err && err.response && err.response.status) {
          SoppyBus.$emit(`status-${err.response.status}`);
          return err.response;
        }
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
      .then((response) => {
        if (isValidJSONResponse(response)) {
          let data = mergeWithState(rootState, response.data);
          dispatch('setSoppyPreloadState', { path, data }, { root: true });
          dispatch('setSoppyState', { data }, { root: true });
          if (data.to) SoppyBus.$emit('redirect', { name: data.to });
        }
        return response;
      })
      .catch((err) => {
        if (err && err.response && err.response.status) {
          SoppyBus.$emit(`status-${err.response.status}`);
          return err.response;
        }
      })
      .finally(() => {
        commit('removeGetting', path);
      });
  },

  preloadData(
    { commit, dispatch, rootState },
    { path, force = true, cancelable = true, cancel = true, use = false },
  ) {
    if (
      !force &&
      rootState.preloadState.hasOwnProperty(path) &&
      Object.keys(rootState.preloadState[path]).length
    ) {
      let data = rootState.preloadState[path];
      if (use) dispatch(`setSoppyState`, { data }, { root: true });
      return dispatch(`setSoppyPreloadState`, { path, data }, { root: true });
    }

    let opts = {};
    if (cancel && state.preloadCancelSource) state.preloadCancelSource.cancel('cancel-preloadData');
    if (cancelable) {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      commit('setPreloadCancelSource', source);
      opts.cancelToken = source.token;
    }

    commit('addPreloading', path);
    return axios
      .get(path, opts)
      .then((response) => {
        if (isValidJSONResponse(response)) {
          let data = mergeWithState(rootState, response.data);
          dispatch(`setSoppyPreloadState`, { path, data }, { root: true });
          if (use) dispatch(`setSoppyState`, { data }, { root: true });
        }
        return response;
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          SoppyBus.$emit(`cancel-preloadData`);
        } else if (err && err.response && err.response.status) {
          SoppyBus.$emit(`status-${err.response.status}`);
          return err.response;
        }
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

  setPreloadCancelSource(state, source) {
    state.preloadCancelSource = source;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true,
};
