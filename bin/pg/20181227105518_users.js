
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    // could use table.timestamp for 'login,created,deleted_at'
    table.integer('id').unique().primary()
    table.string('username').unique()
    table.string('hash')
    table.string('last_login_at')
    table.string('created_at')
    table.boolean('deleted')
    table.string('deleted_at')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users')  
};
