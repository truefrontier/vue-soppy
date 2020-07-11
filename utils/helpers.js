/**
 * Clone an object to facilitate immubility
 * @param  {JSON} data
 * @param  {Object} fallback    If data is falsey, it will use this
 * @return {JSON}
 */
export const clone = (data, fallback = {}) => JSON.parse(JSON.stringify(data || fallback));

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 * @see https://stackoverflow.com/a/37164538/622287
 */
export const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);

/**
 * Test variable to see if it's a String
 * @param  {String} item
 * @return {Boolean}
 * @see https://stackoverflow.com/a/9436948/622287
 */
export const isString = (item) => typeof item === 'string' || item instanceof String;

/**
 * Test variable to see if it's an Array
 * @param  {Array} item
 * @return {Boolean}
 */
export const isArray = (item) => Array.isArray(item);

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
    if (rootState.hasOwnProperty(key) && isObject(data[key])) {
      obj[key] = Object.assign(clone(rootState[key]), data[key]);
    } else {
      obj[key] = data[key];
    }
    return obj;
  }, {});
};

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 * @see https://stackoverflow.com/a/37164538/622287
 */
export const mergeDeep = (target, source) => {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};
