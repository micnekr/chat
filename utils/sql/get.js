module.exports = function(utils) {
  return function get() {
    const addToLimit = " LIMIT 1";
    if (typeof arguments[0] === 'object') {
      arguments[0].text += addToLimit;
    } else {
      arguments[0] += addToLimit;
    }
    return utils.pool.query(...arguments);
  }
}