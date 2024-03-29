module.exports = function(utils) {

  let sql = utils.sql;

  let module = {};

  // how to split words to tokens
  let completeSplit = module.completeSplit = function(str) {
    return "%" + str.replace(/\s/g, '').split("").join("%") + "%";
  }

  let wordSplit = module.wordSplit = function(str) {
    return "%" + str.replace(/\s/g, "%") + "%";
  }

  let suggestChats = module.suggestChats = function(userInput, transformationMethod, done) {

    // tokenize
    userInput = transformationMethod(userInput);
    let query = `SELECT name, num_of_users, id
    FROM chats
    WHERE LOWER(name) LIKE $1 `;
    sql.pool.query(query, [userInput], function(err, data) {
      if (err) {
        return done(err);
      } else {
        return done(null, data.rows);
      }
    })
  }

  return module;
}