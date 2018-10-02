exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('projects', table => {
      table.increments('id').primary();
      table.integer('project_id').unsigned();
      table.foreign('project_id').references('projects.id');
      table.string('title').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('palettes', table => {
      table.increments('id').primary();
      table.integer('project_id').unsigned();
      table.foreign('project_id').references('projects.id');
      table.string('title');
      table.string('color_one');
      table.string('color_two');
      table.string('color_three');
      table.string('color_four');
      table.string('color_five');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('palettes'),
    knex.schema.dropTable('projects')
  ]);
};
