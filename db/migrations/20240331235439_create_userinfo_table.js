// In the migration file for creating userinfo table
exports.up = function(knex) {
    return knex.schema.createTable('userinfo', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned();
      table.string('name').notNullable();
      table.string('email').notNullable();
      table.string('profile_pic_path');
      table.decimal('balance', 10, 2).notNullable(); 
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('userinfo');
  };
  