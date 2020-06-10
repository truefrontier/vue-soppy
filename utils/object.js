export const clone = (data, fallback = {}) => JSON.parse(JSON.stringify(data || fallback));
