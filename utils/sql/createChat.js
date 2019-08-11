module.exports = function(utils) {

  let module = {};

  //creates chat with prior check of avaliability, returns a boolean if a new chat was created and the chat id
  let addChatIfNotExists = module.addChatIfNotExists = function(name, chatAdmissionTypeId, adminId, done) {

    // check if chat exists
    let query = `SELECT id
    FROM chats
    WHERE name=$1`;
    utils.sql.get(query, [name], (err, data) => {
      if (err) return done(err);

      // if chat exists,
      if (data.rows[0]) return done(err, false);

      // othrwise, create the chat
      let query = `INSERT INTO chats (name, admission_type_id, admin_id)
                   VALUES ($1, $2, $3) RETURNING *`;
      utils.sql.pool.query(query, [name, chatAdmissionTypeId, adminId], (err, data) => {
        if (err) return done(err);

        // return last id
        return done(null, true, data.rows[0].id);
      })
    });
  }

  return module;
}