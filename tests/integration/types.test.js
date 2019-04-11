import 'babel-polyfill';
import request from 'supertest';
import mongoose from 'mongoose';
import {
  Type
} from '../../models/types';
import app from '../../index';

let server

describe('/api/v1/types', () => {
  beforeAll(() => {
    server = app;
  });
  beforeEach(() => {

  });
  afterEach(() => {

  });
  afterAll(async () => {
    await Type.deleteMany();
    server.close();
  });
  describe('GET /', () => {
    it('should return all the roles', async () => {
      await Type.collection.bulkWrite([{
        insertOne: {
          title: 'journal'
        }
      }, {
        insertOne: {
          title: 'fashion'
        },
      }]);

      const response = await request(server).get('/api/v1/types');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some(g => g.title === 'journal')).toBeTruthy();
      expect(response.body.some(g => g.title === 'fashion')).toBeTruthy();
    });
  });
  describe('POST /', () => {
    it('should create a new type if it is unique', async () => {
      const type = {
        title: 'journals'
      };

      const response = await request(server).post('/api/v1/types').send(type);

      const newType = await Type.find({
        title: 'journals'
      });

      expect(newType).not.toBeNull();
      expect(response.status).toBe(200);
    });
    it('should return 400 if type already exist', async () => {
      const type = {
        title: 'science'
      }

      await Type.collection.bulkWrite([{
        insertOne: {
          title: 'science'
        }
      }]);

      const response = await request(server).post('/api/v1/types').send(type);
      expect(response.status).toBe(400);
    });
    it('should return 400 if the payload property, title is less than 5 characters', async () => {
      const type = {
        title: 'scie'
      }

      const response = await request(server).post('/api/v1/types').send(type);
      expect(response.status).toBe(400);
    });
    it('should return 400 if the payload property, title is more than 25 characters', async () => {
      const type = {
        title: new Array(30).join('a')
      }

      const response = await request(server).post('/api/v1/types').send(type);
      expect(response.status).toBe(400);
    });
  });
  describe('PUT /:id', () => {
    it('should update an existing type', async () => {
      const type = new Type({
        title: 'fashions'
      });

      await type.save();

      const id = type._id;
      const newTitle = 'dressing';

      const response = await request(server).put(`/api/v1/types/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', newTitle);
    });
    it('should return 404 if an invalid id is passed', async () => {
      const id = 1;
      const newTitle = 'social';

      const response = await request(server).put(`/api/v1/types/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(404);
    });
    it('should return 400 if the payload, title is less than 5 characterss', async () => {
      const type = new Type({
        title: 'nature'
      });

      await type.save();

      const id = type._id;
      const newTitle = 'nat';

      const response = await request(server).put(`/api/v1/types/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(400);
    });
    it('should return 400 if type already exist', async () => {
      await Type.collection.bulkWrite([{
        insertOne: {
          title: 'Humanities'
        }
      }, {
        insertOne: {
          title: 'Medicine'
        }
      }]);

      const type = new Type({
        title: 'clean'
      });

      await type.save();

      const id = type._id;
      const newTitle = 'Medicine';

      const response = await request(server).put(`/api/v1/types/${id}`).send({
        title: newTitle
      });
      expect(response.status).toBe(400);
    });
  });
  describe('GET /:id', () => {
    it('should return an existing type', async () => {
      const type = new Type({
        title: 'footwear'
      });

      await type.save();

      const id = type._id;

      const response = await request(server).get(`/api/v1/types/${id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', type.title);
    });
  });
});