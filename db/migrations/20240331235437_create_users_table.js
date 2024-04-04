// In the migration file for creating user table
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username').notNullable();
      table.string('password').notNullable();
      table.integer('type').notNullable(); // assuming type is a string
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user');
  };
  