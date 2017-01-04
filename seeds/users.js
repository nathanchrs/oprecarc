
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      return Promise.all([
        // Inserts seed entries
        knex('users').insert({ nim: 13515001, name: 'Nathan Chris', gender: 'male', email: 'nathanchrs@nathanchrs.com', phone: '088888888', line: 'nathanchrs', bio: '# test', password: '$2a$08$QOWxgpmzcvdZVMLqYDH6Euo/0qggLEgGUEwkyNcZV/nq8JYPQetf.', role: 'admin' }), // password: aaa
        knex('users').insert({ nim: 13515002, name: 'User 2', gender: 'female', email: 'test2@test.com', phone: '0881238888', line: 'user2', bio: '#2 test', password: '$2a$08$QOWxgpmzcvdZVMLqYDH6Euo/0qggLEgGUEwkyNcZV/nq8JYPQetf.', role: 'cakru' }), // password: aaa
        knex('users').insert({ nim: 13515005, name: 'user 005', gender: 'male', email: '05@nathanchrs.com', phone: '5555555', line: '5athanchrs', bio: '#5 test', password: '$2a$08$QOWxgpmzcvdZVMLqYDH6Euo/0qggLEgGUEwkyNcZV/nq8JYPQetf.', role: 'cakru' }), // password: aaa
        knex('users').insert({ nim: 13515999, name: '999zz', gender: 'male', email: '999@nathanchrs.com', phone: '99999', line: '9athanchrs', bio: '9# test', password: '$2a$08$QOWxgpmzcvdZVMLqYDH6Euo/0qggLEgGUEwkyNcZV/nq8JYPQetf.', role: 'admin' }), // password: aaa
      ]);
    });
};
