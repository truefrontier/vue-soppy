export const clone = (data, fallback = {}) => JSON.parse(JSON.stringify(data || fallback));
export const isString = (str) => typeof str === 'string' || str instanceof String;
export const isArray = (arr) => Array.isArray(arr);
