/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('userinfo').del()
  await knex('userinfo').insert([
    { user_id: 1, name: 'naruto uzomaki', email: 'naruto@example.com', balance: 100.00 },
    { user_id: 2, name: 'kakashi hatake', email: 'kakashi@example.com', balance: 200.00 },
  ]);
};
