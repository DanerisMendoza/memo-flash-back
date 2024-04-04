/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('user_details').del()
  await knex('user_details').insert([
    { user_id: 1, name: 'naruto uzomaki', email: 'naruto@example.com', balance: 100.00, profile_pic_path: 'images/profile_pic/avatar1.png' },
    { user_id: 2, name: 'kakashi hatake', email: 'kakashi@example.com', balance: 200.00, profile_pic_path: 'images/profile_pic/avatar1.png' },
  ]);
};
