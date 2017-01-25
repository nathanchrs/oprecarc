
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({ nim: 00000000, name: 'Administrator', password: '$2a$08$Wn3jW9b0VvPkshi272ctweyyn0O7.bFXx4xFCoNHpBdiCDashRI/q', role: 'admin', bio: 'This is a starter admin account. Create a new admin user, then delete this account or change its password.' }) // Password: admin
      ]);
    });
};
