let projectData = [{
  name: 'first project',
  palettes: [{
    name: 'first A palette',
    swatches: {
      hexarray: ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b']
    }
  },
  {
    name: 'first B palette',
    swatches: {
      hexarray: ['#5ddee3', '#c2ebe3', '#6a4de9', '#57f350', '#5f3a6e']
    }
  }]
},
{
  name: 'second project',
  palettes: [{
    name: 'second A palette',
    swatches: {
      hexarray: ['#98f30b', '#e3501c', '#4538bb', '#3cce59', '#fbdd13']
    }
  }]
},
{
  name: 'third project',
  palettes: [{
    name: 'third A palette',
    swatches: {
      hexarray: ['#a941ec', '#de6213', '#47dc8a', '#4b8de9', '#4ad232']
    }
  }]
}];


exports.seed = function (knex, Promise) {
  // Delete all table rows first
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .then(() => {

      let palettesPromises = [];




      return Promise.all([
        // Inserts seed entries
        knex('table_name').insert({ id: 1, colName: 'rowValue1' }),
        knex('table_name').insert({ id: 2, colName: 'rowValue2' }),
        knex('table_name').insert({ id: 3, colName: 'rowValue3' })
      ]);
    });
};