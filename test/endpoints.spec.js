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

  beforeEach(done => {
    database.seed.run();
    done();
  })

  describe('GET /api/v1/projects', () => {
    // happy path
    it('should return all of the projects', done => {
      chai.request(server)
        .get('/api/v1/projects')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('array'); // if object, put object here
          response.body.length.should.equal(3);

          // always assert that the property exists before value

          // response.body[0].should.have.property('lastname');
          // response.body[0].lastname.should.equal('Turing');

          // response.body[0].should.have.property('program');
          // response.body[0].program.should.equal('FE');

          // response.body[0].should.have.property('enrolled');
          // response.body[0].enrolled.should.equal(true);

          done();
        });
    });

    //sad path

  });

  describe('GET /api/v1/students/Turing', () => {

    // happy path
    it.skip('should return only the Turing student', done => {
      chai.request(server)
        .get('/api/v1/students/Turing')
        .end((error, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');

          response.body.should.have.property('lastname');
          response.body.lastname.should.equal('Turing');

          response.body.should.have.property('program');
          response.body.program.should.equal('FE');

          response.body.should.have.property('enrolled');
          response.body.enrolled.should.equal(true);

          done();
        });
    });

    // sad path
    it.skip('should return 404 for invalid last name', done => {
      chai.request(server)
        .get('/api/v1/students/foo')
        .end((error, response) => {
          response.should.have.status(404);
          done();
        })
    })

  })

  describe('POST /api/v1/students', () => {
    it.skip('should create a new student', done => {
      chai.request(server)
        .post('/api/v1/students')
        .send({
          lastname: 'Knuth',
          program: 'FE',
          enrolled: true
        })
        .end((error, response) => {
          response.should.have.status(201);
          response.body.should.be.a('object');

          response.body.should.have.property('lastname');
          response.body.lastname.should.equal('Knuth');

          response.body.should.have.property('program');
          response.body.program.should.equal('FE');

          response.body.should.have.property('enrolled');
          response.body.enrolled.should.equal(true);

          chai.request(server)
            .get('/api/v1/students')
            .end((error, response) => {
              response.should.have.status(200);
              response.body.should.be.a('array');
              response.body.length.should.equal(4);

              // then we wouuld check if that object actually was added
              // by checking last name is in array.
              done();
            })

        })
    })

    it.skip('should not create a record with missing data', done => {
      chai.request(server)
        .post('/api/v1/students')
        .send({
          lastname: 'Knuth',
          program: 'FE'
        })
        .end((error, response) => {
          response.should.have.status(422);
          // should say what field they were missing
          response.body.error.should.equal('You are missing data');
          done();
        });


    });


  });


});