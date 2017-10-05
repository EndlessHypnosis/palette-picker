// TODO: have a comment on every line

// setup express
// bring in the express library
const express = require('express');
// DESCRIBE:
const app = express();

// json parser so that express can parse incoming body
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// so that static assets can be served over localhost?
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


// setup knex
// we need to know what environment we're in...defaulting to dev
const environment = process.env.NODE_ENV || 'development';
// get the knex configuration (for the specific environment)
const configuration = require('./knexfile')[environment];
// now we're ready to connect knex to the database
const database = require('knex')(configuration);


// set the port based on environment, or default to 3000
app.set('port', process.env.PORT || 3000);
// setting locals title (but never used); // TODO remove?
app.locals.title = 'Palette Picker';

// app.locals.palettes = {
//   palette1: ['#fbdd13', '#3cce59', '#4538bb', '#e3501c', '#98f30b'],
//   palette2: ['#5ddee3', '#c2ebe3', '#6a4de9', '#57f350', '#5f3a6e'],
//   palette3: ['#a941ec', '#de6213', '#47dc8a', '#4b8de9', '#4ad232']
// };

// app.locals.projects = {
//   project1: ['palette1', 'palette2'],
//   project2: ['palette3']
// };

// Get all projects
app.get('/api/v1/projects', (request, response) => {

  database('projects').select()
  .then(projects => {
    response.status(200).json(projects);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

// Get all palettes
app.get('/api/v1/palettes', (request, response) => {

  database('palettes').select()
  .then(palettes => {
    response.status(200).json(palettes);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

// Create new project
app.post('/api/v1/projects', (request, response) => {

  const { projectName } = request.body;
  console.log('add project in api:', projectName);
  

  if (!projectName || projectName.length < 1) {
    return response
      .status(422)
      .send({ error: 'Project NOT Added: Please submit a name for the project' })
  }

  database('projects').insert({
    name: projectName
  }, 'id')
    .then(project => {
      response.status(201).json({ id: project[0] }); // why are we sending back the id of the newly created project? Why not the entire obj?
    })
    .catch(error => {
      response.status(500).json({ error });
    });

});



















// Get all palettes
// app.get('/api/palettes', (request, response) => {
//   response.status(200).json(app.locals.palettes)
// })

// Add palette to project
app.get('/api/palettes', (request, response) => {
  const { paletteName, projectLink, paletteColors } = request.body;

  // do the stuff that adds the palette with project link
})






















// Example endpoints from code-along


app.get('/api/messages/:id', (request, response) => {

  // if (app.locals.messages[request.params.id]) {
  //   response.json({
  //     id: request.params.id,
  //     value: app.locals.messages[request.params.id]
  //   });
  // } else {
  //   response.status(404).send();
  // }

  // OR (better logic)

  const { id } = request.params;
  const message = app.locals.messages[id];

  if (!message) {
    // the return here is only used to escape the function so we dont have to use else
    return response.sendStatus(404);
  }

  response.status(200).json({ id, message });

});

app.post('/api/messages', (request, response) => {

  const id = Date.now();
  const { message } = request.body;

  app.locals.messages[id] = message;

  response.status(201).json({ id, message }) // 201 is successful post request

});

app.put('/api/messages/:id', (request, response) => {

  const { id } = request.params;
  const localMessage = app.locals.messages[id];
  const requestMessage = request.body.message;

  if (!localMessage) {
    return response.sendStatus(404);
  }

  if (!requestMessage) {
    // 422 is user error
    return response.status(422).json({
      error: 'Missing required parameter: message'
    })
  }

  app.locals.messages[id] = requestMessage;
  // 204 might be more appropriate status code,
  // but can you return the object back?
  response.status(200).json({ id, requestMessage })

});

app.delete('/api/messages/:id', (request, response) => {

  const { id } = request.params;
  const localMessage = app.locals.messages[id];

  if (!localMessage) {
    return response.sendStatus(404);
  }

  delete app.locals.messages[id];
  response.sendStatus(200); // maybe 204

})




// Need This!

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});