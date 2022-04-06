/**
 * @param {object} object
 * @returns {string}
 */
export function toString(object) {
  return JSON.stringify(object)
}

export function toObject(string) {
  return JSON.parse(string)
}
