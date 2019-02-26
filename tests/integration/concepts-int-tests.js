const Clarifai = require('./../../src');
const {errorHandler} = require('./helpers');
const langConceptId = '的な' + Date.now();
const beerId = 'beer' + Date.now();
const ferrariId = 'ferrari' + Date.now();

let app;

describe('Integration Tests - Concepts', () => {
  const conceptsIds = [
    'porsche' + Date.now(),
    'rolls royce' + Date.now(),
    'lamborghini' + Date.now(),
    langConceptId,
    beerId,
    ferrariId
  ];

  beforeAll(() => {
    app = new Clarifai.App({
      apiKey: process.env.CLARIFAI_API_KEY,
      apiEndpoint: process.env.API_ENDPOINT
    });
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

  it('updates a concept name', done => {
    const originalName = conceptsIds[0];
    const newName = `${originalName}-newName`;

    app.concepts.update({ id: originalName, name: newName })
      .then(concepts => {
        expect(concepts[0].id).toBe(originalName);
        expect(concepts[0].name).toBe(newName);
        done();
      })
      .catch(errorHandler.bind(done));
  });
});
