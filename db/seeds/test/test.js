let projectData = [{
  name: 'project 1',
  palettes: [{
    name: 'palette 1-A',
    swatches: ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b']
  },
  {
    name: 'palette 1-B',
    swatches: ['#5ddee3', '#c2ebe3', '#6a4de9', '#57f350', '#5f3a6e']
  }]
},
{
  name: 'project 2',
  palettes: [{
    name: 'palette 2-A',
    swatches: ['#98f30b', '#e3501c', '#4538bb', '#3cce59', '#fbdd13']
  }]
},
{
  name: 'project 3',
  palettes: [{
    name: 'palette 3-A',
    swatches: ['#a941ec', '#de6213', '#47dc8a', '#4b8de9', '#4ad232']
  },
  {
  name: 'palette 3-B',
  swatches: ['#5ddee3', '#c2ebe3', '#6a4de9', '#57f350', '#5f3a6e']
  },
  {
    name: 'palette 3-C',
    swatches: ['#fbdd13', '#98f30b', '#6a4de9', '#6a4de9', '#5f3a6e']
  }]
},
{
  name: 'project 4',
  palettes: []
},
{
  name: 'project 5',
  palettes: [{
    name: 'palette 5-A',
    swatches: ['#98f30b', '#e3501c', '#4538bb', '#3cce59', '#fbdd13']
  }]
}];

const createProject = (knex, project) => {
  return knex('projects').insert({
    name: project.name
  }, 'id')
    .then(projectId => {
      let palettePromises = [];
      let palettePayload;

      project.palettes.forEach(palette => {
        // add project_id column
        palettePayload = Object.assign(palette, { project_id: projectId[0] });
        // need to stringify the array so that postreSQL
        // doesn't think it's a data type array (it's really json)
        palettePayload.swatches = JSON.stringify(palettePayload.swatches);
        palettePromises.push(createPalette(knex, palettePayload));
      });
      return Promise.all(palettePromises);
    });
};

const createPalette = (knex, palette) => {
  return knex('palettes').insert(palette);
};

exports.seed = function (knex, Promise) {
  // Delete all table rows first
  return knex('palettes').del()
    .then(() => knex('projects').del())
    // now that the data is clean, insert new data
    .then(() => {
      let projectPromises = [];
      projectData.forEach(project => {
        projectPromises.push(createProject(knex, project));
      });
      return Promise.all(projectPromises);
    })
    .catch(error => console.log('Error seeding data:', error));
};