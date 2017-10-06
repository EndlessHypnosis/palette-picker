
// SETUP: express
// bring in the express library
const express = require('express');
// initialize a new express object using the function we just imported
const app = express();
// set the port based on environment, or default to 3000
app.set('port', process.env.PORT || 3000);

// SETUP: body-parser
// json parser so that express can parse incoming body
const bodyParser = require('body-parser');
// these 2 lines are just configuring the middleware of the app for body parser to work
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SETUP: Static Assets
// these lines just ensure that we can server basic html/css/js over
// localhost, along with serving our api on the same port.
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// SETUP: knex
// we need to know what environment we're in...defaulting to dev
const environment = process.env.NODE_ENV || 'development';
// get the knex configuration (for the specific environment)
const configuration = require('./knexfile')[environment];
// now we're ready to connect knex to the database
const database = require('knex')(configuration);


// Get all projects
app.get('/api/v1/projects', (request, response) => {
  // select all rows from projects table
  database('projects').select()
  .then(projects => {
    // return a response of 200 and the projects collection
    response.status(200).json(projects);
  })
  .catch(error => {
    // something went wrong, send an error back
    response.status(500).json({ error });
  });
});

// Get all palettes
app.get('/api/v1/palettes', (request, response) => {
  // select all rows from palettes table and join to projects to get the project name
  database('projects')
  .join('palettes', 'projects.id', '=', 'palettes.project_id')
  .select('projects.name as project_name', 'palettes.*')
  .then(palettes => {
    // return a response of 200 and the palettes collection
    response.status(200).json(palettes);
  })
  .catch(error => {
    // something went wrong, send an error back
    response.status(500).json({ error });
  });
});

// Create new project
app.post('/api/v1/projects', (request, response) => {
  // get the projectName from the request's body
  const { projectName } = request.body;
  
  // make sure a valid project name was sent
  if (!projectName || projectName.length < 1) {
    // if invalid project name, send back client error
    return response
      .status(422)
      .json({ 
        status: 422,
        error: 'Project NOT Added: Please submit a name for the project.' 
      });
  }

  // check if project name is unique
  database('projects').select()
  .then(projects => {
    // check if any project names match
    let projectsFiltered = projects.filter(project => {
      return project.name === projectName;
    });
    // if a match was found, that means we have a duplicate
    if (projectsFiltered.length > 0) {
      // can't add duplicate project names, send back client error
      response
      .status(409)
      .json({
        status: 409,
        error: 'Project name already used: Please choose a new name.' 
      });
    } else {
      // no duplicates, go ahead and add project
      database('projects').insert({
        name: projectName
      }, '*')
      .then(project => {
        // return a response of 201 and the entire payload for the newly created project
        response.status(201).json(Object.assign({status: 201}, project[0]));
      })
      .catch(error => {
        // something went wrong, send an error back
        response.status(500).json(Object.assign({ status: 201 },{ error }));
      });
    }
  })
});

// Delete palette
app.delete('/api/v1/palettes/:id', (request, response) => {
  // grab palette id to delete off the params
  const paletteIdToDelete = request.params.id;
  // run the delete where id's match
  database('palettes')
  .where('id', paletteIdToDelete)
  .del()
  .then(palette => {
    // success, return 200
    response.sendStatus(200);
  })
  .catch(error => {
    // something went wrong, send an error back
    response.status(500).json({ error });
  });
});

// Add palette to project
app.post('/api/v1/palettes', (request, response) => {
  // destructure the request body
  const { paletteName, projectLink, swatchesList } = request.body;
  // see if we can come up with better logic for this conditional
  // dont really like the idea of adding them to an array and then
  // iterating over...as we can't check the length of swatchesList
  if (!paletteName || !projectLink || swatchesList.length !== 5) {
    // I guess with 1 blanket conditional we dont know details to give a good error message
    // Still don't really like the idea of adding them to an array,
    // kinda still feels hacky...but not sure what's a cleaner approach.
    return response
      .status(422)
      .send({ error: 'Palette Not Added: Invalid Input' });
  }
  // everything good, insert the new palette
  database('palettes').insert({
    name: paletteName,
    swatches: JSON.stringify(swatchesList),
    project_id: projectLink
  }, '*')
  .then(palette => {
    // return a response of 201 and the entire payload for the newly created palette
    response.status(201).json(palette[0]);
  })
  .catch(error => {
    // something went wrong, send an error back
    response.status(500).json({ error });
  });
});

// Without this, nothing would work,
// as this actually starts the express
// listener on the specified port
app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;