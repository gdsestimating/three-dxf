// This is based on the example code found from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
// Example code on MDN is public domain or CC0 (your preference) or MIT depending when the
// example code was added:
// https://developer.mozilla.org/en-US/docs/MDN/About

export default (value, exp) => {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math.round(value)
    }
    value = +value
    exp = +exp
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN
    }
    // Shift
    value = value.toString().split('e')
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)))
    // Shift back
    value = value.toString().split('e')
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp))
  }