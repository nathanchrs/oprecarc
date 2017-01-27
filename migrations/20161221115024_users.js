
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function (table) {
      table.integer('nim').primary();
      table.string('name');
      table.string('gender');
      table.string('email');
      table.string('phone');
      table.string('line');
      table.string('password');
      table.text('bio');
      table.string('role');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users')
  ]);
};
