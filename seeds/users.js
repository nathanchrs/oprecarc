
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({id: 1, name: 'Nathan Chris', nim: 13515001, gender: 'male', email: 'nathanchrs@nathanchrs.com', phone: '088888888', line: 'nathanchrs', bio: '# test', password: '$2a$08$QOWxgpmzcvdZVMLqYDH6Euo/0qggLEgGUEwkyNcZV/nq8JYPQetf.', role: 'admin'}), // password: aaa
      ]);
    });
};
