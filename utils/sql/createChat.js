module.exports = function (utils) {

    let module = {};

    //creates chat with prior check of avaliability, returns a boolean if a new chat was created and the chat id
    let addChatIfNotExists = module.addChatIfNotExists = function (name, chatAdmissionTypeId, adminId, client, done, finish) {
        // a utility to automatically log and disconnect on error
        function disconnectOnError(err) {
            if (err) {
                // disconnect the client
                done();
                return finish(err);
            }
        }

        // check if chat exists
        let query = `SELECT id
    FROM chats
    WHERE name=$1`;
        utils.sql.get(query, [name], (err, data) => {
            if (err) return finish(err);

            // if chat exists,
            if (data.rows[0]) return finish(err, false);

            // othrwise, create the chat
            let query = `INSERT INTO chats (name, admission_type_id, admin_id)
                   VALUES ($1, $2, $3) RETURNING *`;
            client.query(query, [name, chatAdmissionTypeId, adminId], (err, data) => {
                disconnectOnError(err);

                // return last id
                return finish(null, true, data.rows[0].id);
            })
        });
    };

    return module;
};