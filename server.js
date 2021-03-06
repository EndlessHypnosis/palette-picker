const express = require('express');
const app = express();
app.set('port', process.env.PORT || 3000);

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);


// app.use(function (req, res, next) {
//   var schema = (req.headers['x-Forwarded-proto'] || '').toLowerCase();
//   if (schema === 'https') {
//     next();
//   } else {
//     res.redirect('https://' + req.headers.host + req.url);
//   }
// });

app.use(function (req, resp, next) {
  if (req.headers['x-forwarded-proto'] == 'http') {
    return resp.redirect(301, 'https://' + req.headers.host + '/');
  } else {
    return next();
  }
});


// const requireHTTPS = (req, res, next) => {
//   if (req.headers['x-forwarded-proto'] != 'https') {
//     return res.redirect('https://' + req.get('host') + req.url);
//   }
//   next();
// };
// app.use(requireHTTPS);


// app.configure(function () {
//   app.set('views', __dirname + '/views');
//   app.set('view engine', 'ejs');
//   app.use(express.bodyParser());
//   app.use(express.methodOverride());
//   app.use(express.cookieParser());
//   app.configure('production', function () {
    
//   });
//   app.use(app.router);
//   app.use(express.static(__dirname + '/public'));
//   app.use(express.favicon(__dirname + '/public/favicon.ico'));
// });



app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
  .then(projects => {
    response.status(200).json(projects);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

app.get('/api/v1/palettes', (request, response) => {
  database('projects')
  .join('palettes', 'projects.id', '=', 'palettes.project_id')
  .select('projects.name as project_name', 'palettes.*')
  .then(palettes => {
    response.status(200).json(palettes);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/projects', (request, response) => {
  const { projectName } = request.body;
  
  if (!projectName || projectName.length < 1) {
    return response
      .status(422)
      .json({ 
        status: 422,
        error: 'Project NOT Added: Please submit a name for the project.' 
      });
  }

  database('projects').select()
  .then(projects => {
    let projectsFiltered = projects.filter(project => {
      return project.name === projectName;
    });
    if (projectsFiltered.length > 0) {
      response
      .status(409)
      .json({
        status: 409,
        error: 'Project name already used: Please choose a new name.' 
      });
    } else {
      database('projects').insert({
        name: projectName
      }, '*')
      .then(project => {
        response.status(201).json(Object.assign({status: 201}, project[0]));
      })
      .catch(error => {
        response.status(500).json(Object.assign({ status: 201 },{ error }));
      });
    }
  })
});

app.delete('/api/v1/palettes/:id', (request, response) => {
  const paletteIdToDelete = request.params.id;
  database('palettes')
  .where('id', paletteIdToDelete)
  .del()
  .then(palette => {
    response.sendStatus(200);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

app.post('/api/v1/palettes', (request, response) => {
  const { paletteName, projectLink, swatchesList } = request.body;
  if (!paletteName || !projectLink || swatchesList.length !== 5) {
    return response
      .status(422)
      .send({ error: 'Palette Not Added: Invalid Input' });
  }
  database('palettes').insert({
    name: paletteName,
    swatches: JSON.stringify(swatchesList),
    project_id: projectLink
  }, '*')
  .then(palette => {
    response.status(201).json(palette[0]);
  })
  .catch(error => {
    response.status(500).json({ error });
  });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;