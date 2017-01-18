
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('events', function (table) {
      table.increments('id').primary();
      table.string('name').required();
      table.dateTime('start_time').required();
      table.dateTime('end_time').required();
      table.dateTime('late_time').required();
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
