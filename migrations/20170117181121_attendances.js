
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('attendances', function (table) {
      table.increments('id').primary();
      table.dateTime('timestamp');
      table.integer('user_nim');
      table.integer('event_id');
      table.string('notes');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('attendances')
  ]);
};
