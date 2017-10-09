const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

// SETUP: knex
const environment = 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// Before we test our endpoints, lets just make sure the page rendered correctly
describe('Client Routes', () => {
  // happy path test
  it('should return the homepage with the correct header', done => {
    chai.request(server)
      .get('/')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.html;
        response.res.text.should.include('<h1>Palette Picker</h1>');
        done();
      });
  });

  // sad path test
  it('should return a 404 for a route that does not exist', done => {
    chai.request(server)
      .get('/foo')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });
});


// Endpoint tests
describe('API Routes', () => {

  before(done => {
    database.migrate.latest()
      .then(() => {
        done();
      })
  })

  // Re-seed data between tests
  beforeEach(done => {
    database.seed.run()
      .then(() => {
        done();
      })
  })

  describe('GET /api/v1/projects', () => {

    it('should return all of the projects', done => {
      chai.request(server)
        .get('/api/v1/projects')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(5);
          response.body[0].should.have.property('id');
          response.body[0].should.have.property('name');
          response.body[0].should.have.property('created_at');
          response.body[0].should.have.property('updated_at');

          let projectOne = response.body.filter(project => {
            return project.name === 'project 1'
          })
          projectOne.length.should.equal(1);

          let projectFoo = response.body.filter(project => {
            return project.name === 'foo'
          })
          projectFoo.length.should.equal(0);

          done();
        });
    });

  });


  describe('GET /api/v1/palettes', () => {

    it('should return all of the palettes', done => {
      chai.request(server)
        .get('/api/v1/palettes')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array');
          response.body.length.should.equal(7);
          response.body[0].should.have.property('id');
          response.body[0].should.have.property('project_name');
          response.body[0].should.have.property('project_id');
          response.body[0].should.have.property('swatches');
          response.body[0].should.have.property('name');
          response.body[0].should.have.property('created_at');
          response.body[0].should.have.property('updated_at');

          let paletteOne = response.body.filter(palette => {
            return palette.name === 'palette 1-B'
          })
          paletteOne.length.should.equal(1);
          paletteOne[0].project_name.should.equal('project 1');
          let swatchesArray = JSON.parse(paletteOne[0].swatches);
          swatchesArray.should.be.a('array');
          swatchesArray.length.should.equal(5);

          let swatchOne = swatchesArray.filter(swatch => {
            return swatch === '#c2ebe3'
          })
          swatchOne.length.should.equal(1);

          done();
        });
    });

  });


  describe('POST /api/v1/projects', () => {

    it('should be able to insert a new project', done => {
      // First make sure there are 5 projects
      chai.request(server)
        .get('/api/v1/projects')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body.length.should.equal(5);
          // Now insert the new project
          chai.request(server)
            .post('/api/v1/projects')
            .send({
              projectName: 'project 6'
            })
            .end((error, response) => {
              response.should.have.status(201);
              response.should.be.json;
              response.body.should.be.a('object');
              response.body.should.have.property('status');
              response.body.should.have.property('id');
              response.body.should.have.property('name');
              response.body.name.should.equal('project 6');
              // Now make sure there are 6 projects
              chai.request(server)
                .get('/api/v1/projects')
                .end((error, response) => {
                  response.should.have.status(200);
                  response.body.should.be.a('array');
                  response.body.length.should.equal(6);

                  done();
                })
            });
        });
    });


    it('should should return 409 if name taken', done => {
      // First make sure there is a project with name 'project 1'
      chai.request(server)
        .get('/api/v1/projects')
        .end((error, response) => {
          response.should.have.status(200);

          let projectOne = response.body.filter(project => {
            return project.name === 'project 1'
          })
          projectOne.length.should.equal(1);

          // Now try to insert the new project
          chai.request(server)
            .post('/api/v1/projects')
            .send({
              projectName: 'project 1'
            })
            .end((error, response) => {
              response.should.have.status(409);
              response.body.should.have.property('error');
              response.body.error.should
                .equal('Project name already used: Please choose a new name.');
              done();
            });
        });
    });

  });


  describe('POST /api/v1/palettes', () => {

    it('should be able to insert a new palettes', done => {
      // First make sure there are 7 palettes
      chai.request(server)
        .get('/api/v1/palettes')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body.length.should.equal(7);
          let randomProjectId = response.body[0].project_id;
          // Now insert the new palette
          chai.request(server)
            .post('/api/v1/palettes')
            .send({
              paletteName: 'test palette',
              projectLink: randomProjectId,
              swatchesList: ['#98f30b', '#e3501c', '#4538bb', '#3cce59', '#fbdd13']
            })
            .end((error, response) => {
              response.should.have.status(201);
              // Now make sure there are 8 palettes
              chai.request(server)
                .get('/api/v1/palettes')
                .end((error, response) => {
                  response.should.have.status(200);
                  response.body.should.be.a('array');
                  response.body.length.should.equal(8);

                  done();
                })
            });
        });
    });


    it('should should return 422 if bad input', done => {
      // Now try to insert the new project
      chai.request(server)
        .post('/api/v1/palettes')
        .send({
          foo: 'bar'
        })
        .end((error, response) => {
          response.should.have.status(422);
          response.body.should.have.property('error');
          response.body.error.should
            .equal('Palette Not Added: Invalid Input');
          done();
        });
    });
  });


  describe('DELETE /api/v1/palettes/:id', () => {

    it('should be able to delete a palette', done => {
      // First make sure there are 7 palettes
      chai.request(server)
        .get('/api/v1/palettes')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.a('array');
          response.body.length.should.equal(7);
          let randomPaletteId = response.body[0].id;

          // Now delete the palette
          chai.request(server)
            .delete(`/api/v1/palettes/${randomPaletteId}`)
            .end((error, response) => {
              response.should.have.status(200);

              // Now make sure there are 6 palettes
              chai.request(server)
                .get('/api/v1/palettes')
                .end((error, response) => {
                  response.should.have.status(200);
                  response.body.should.be.a('array');
                  response.body.length.should.equal(6);

                  done();
                })
            });
        });
    });

  });

});