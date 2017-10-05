
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('projects', table => {
      table.increments('id').primary();
      table.string('name');
      table.timestamps(true, true);
    }),

    knex.schema.createTable('palettes', table => {
      table.increments('id').primary();
      table.string('name');
      table.json('swatches');
      table.integer('project_id').unsigned();
      table.foreign('project_id').references('projects.id');
      table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('palettes'),
    knex.schema.dropTable('projects')
  ]);
};
