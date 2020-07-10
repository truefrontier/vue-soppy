/**
 * Clone an object to facilitate immubility
 * @param  {JSON} data
 * @param  {Object} fallback    If data is falsey, it will use this
 * @return {JSON}
 */
export const clone = (data, fallback = {}) => JSON.parse(JSON.stringify(data || fallback));

/**
 * Test variable to see if it's a String
 * @param  {String} str
 * @return {Boolean}
 */
export const isString = (str) => typeof str === 'string' || str instanceof String;

/**
 * Test variable to see if it's an Array
 * @param  {Array} arr
 * @return {Boolean}
 */
export const isArray = (arr) => Array.isArray(arr);

/**
 * Check to see if response is a valid JSON
 * @param  {Object} response
 * @return {Boolean}
 */
export const isValidJSONResponse = (response) => {
  let { data, headers = {} } = response;
  // Test Data
  if (!data) return false;

  // Test Header
  let contentType = headers['content-type'] || headers['Content-Type'] || '';
  if (contentType.toLowerCase().indexOf('json') === -1) return false;

  return true;
};

/**
 * Merge data with existing state
 * @param  {Object} rootState
 * @param  {Object} data      Same structure as State
 * @return {Object}           Merged state
 */
export const mergeWithState = (rootState, data) => {
  return Object.keys(data).reduce((obj, key) => {
    if (rootState.hasOwnProperty(key) && !isString(data[key]) && !isArray(data[key])) {
      obj[key] = Object.assign(clone(rootState[key]), data[key]);
    } else {
      obj[key] = data[key];
    }
    return obj;
  }, {});
};
