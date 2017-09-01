const Clarifai = require('./../src');
const {errorHandler} = require('./helpers');
const langConceptId = '的な' + Date.now();
const beerId = 'beer' + Date.now();
const ferrariId = 'ferrari' + Date.now();

let app;

describe('Concepts', () => {
  const conceptsIds = [
    'porsche' + Date.now(),
    'rolls royce' + Date.now(),
    'lamborghini' + Date.now(),
    langConceptId,
    beerId,
    ferrariId
  ];

  beforeAll(() => {
    app = new Clarifai.App(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      {
        apiEndpoint: process.env.API_ENDPOINT,
        token: process.env.CLIENT_TOKEN
      }
    );
  });

  it('creates concepts given a list of strings', done => {
    app.concepts.create(conceptsIds)
      .then(concepts => {
        expect(concepts).toBeDefined();
        expect(concepts.length).toBe(conceptsIds.length);
        expect(concepts[0].id).toBe(conceptsIds[0]);
        expect(concepts[1].id).toBe(conceptsIds[1]);
        expect(concepts[2].id).toBe(conceptsIds[2]);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('gets concept with id in a different language', done => {
    app.concepts.get(langConceptId)
      .then(concept => {
        expect(concept.id).toBe(langConceptId);
        expect(concept.name).toBe(langConceptId);
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('search concepts', done => {
    app.concepts.search('lab*')
      .then(concepts => {
        expect(concepts.length).toBe(6);
        expect(concepts[0].name).toBe('label');
        done();
      })
      .catch(errorHandler.bind(done));
  });

  it('search concepts in a different language', done => {
    app.concepts.search('狗*', 'zh')
      .then(concepts => {
        expect(concepts.length).toBe(3);
        return app.models.delete();
      })
      .then(response => {
        expect(response.status).toBeDefined();
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
