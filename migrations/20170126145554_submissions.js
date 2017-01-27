
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('submissions', function (table) {
      table.increments('id').primary();
      table.integer('user_nim');
      table.integer('task_id');
      table.text('notes');
      table.integer('grade');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('submissions')
  ]);
};
