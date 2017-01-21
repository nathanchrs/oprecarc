
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('events', function (table) {
      table.increments('id').primary();
      table.string('name');
      table.dateTime('start_time');
      table.dateTime('end_time');
      table.dateTime('late_time');
      table.string('description');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('events')
  ]);
};
