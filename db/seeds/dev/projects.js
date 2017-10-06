
let projectData = [{
  name: 'first project',
  palettes: [{
    name: 'first A palette',
    swatches: ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b']
  },
  {
    name: 'first B palette',
    swatches: ['#5ddee3', '#c2ebe3', '#6a4de9', '#57f350', '#5f3a6e']
  }]
},
{
  name: 'second project',
  palettes: [{
    name: 'second A palette',
    swatches: ['#98f30b', '#e3501c', '#4538bb', '#3cce59', '#fbdd13']
  }]
},
{
  name: 'third project',
  palettes: [{
    name: 'third A palette',
    swatches: ['#a941ec', '#de6213', '#47dc8a', '#4b8de9', '#4ad232']
  }]
}];





const createProject = (knex, project) => {
  return knex('projects').insert({
    name: project.name
  }, 'id')
  .then(projectId => {

    // now construct the palette promises
    let palettePromises = [];
    // will need to construct new payload for the palette with the project id
    let palettePayload;

    project.palettes.forEach(palette => {
      // add project_id column
      palettePayload = Object.assign(palette, {project_id: projectId[0]});
      // need to stringify the array so that postreSQL
      // doesn't think it's a data type array (it's really json)
      palettePayload.swatches = JSON.stringify(palettePayload.swatches);

      palettePromises.push(createPalette(knex, palettePayload));
    });

    return Promise.all(palettePromises);

  });
};



// do we really need a separate function for this?
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