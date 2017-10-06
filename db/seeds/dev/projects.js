exports.seed = function (knex, Promise) {
  // All we do here is delete all the data
  // actual seed data in the test folder
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .catch(error => console.log('Error seeding data:', error));
};