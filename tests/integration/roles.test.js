import 'babel-polyfill';
import request from 'supertest';
import mongoose from 'mongoose';
import {
  Role
} from '../../models/roles';
import {
  User
} from '../../models/users'
import app from '../../index';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

let server;

const payload = {
  _id: mongoose.Types.ObjectId(),
  isAdmin: true
}

const adminToken = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {
  expiresIn: 60 * 60
});

console.log(adminToken);
const regularToken = new User().generateAuthToken();
console.log(regularToken);

describe('/api/v1/roles', () => {
  beforeAll(() => {
    server = app;
  });
  beforeEach(() => {

  });
  afterEach(() => {

  });
  afterAll(async () => {
    await Role.deleteMany();
    server.close();
  });
  describe('GET /', () => {
    it('should return all the roles if user is Admin', async () => {
      await Role.collection.bulkWrite([{
        insertOne: {
          title: 'dmins'
        }
      }, {
        insertOne: {
          title: 'regular'
        },
      }]);

      const response = await request(server)
        .get('/api/v1/roles')
        .set('x-auth-token', adminToken)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.some(g => g.title === 'dmins')).toBeTruthy();
      expect(response.body.some(g => g.title === 'regular')).toBeTruthy();
    });
    it('should 401 if user is not logged in', async () => {
      const response = await request(server)
        .get('/api/v1/roles')
        .set('x-auth-token', regularToken)
        .send();

      expect(response.status).toBe(403);
    });
  });
  describe('POST /', () => {
    it('should create a new role if it is unique', async () => {
      const role = {
        title: 'veteran'
      };

      const response = await request(server).post('/api/v1/roles').send(role);

      const newRole = await Role.find({
        title: 'veteran'
      });

      expect(newRole).not.toBeNull();
      expect(response.status).toBe(200);
    });
    it('should return 400 if role already exist', async () => {
      const roles = {
        title: 'admin'
      }

      await Role.collection.bulkWrite([{
        insertOne: {
          title: 'admin'
        }
      }]);

      const response = await request(server).post('/api/v1/roles').send(roles);
      expect(response.status).toBe(400);
    });
    it('should return 400 if the payload property, title is less than 4 characters', async () => {
      const role = {
        title: 'adm'
      }

      const response = await request(server).post('/api/v1/roles').send(role);
      expect(response.status).toBe(400);
    });
    it('should return 400 if the payload property, title is more than 10 characters', async () => {
      const role = {
        title: new Array(12).join('a')
      }

      const response = await request(server).post('/api/v1/roles').send(role);
      expect(response.status).toBe(400);
    });
  });
  describe('PUT /:id', () => {
    it('should update an existing role', async () => {
      const role = new Role({
        title: 'amateurs'
      });

      await role.save();

      const id = role._id;
      const newTitle = 'superAdmin';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', newTitle);
    });
    it('should return 404 if an invalid id is passed', async () => {
      const id = 1;
      const newTitle = 'superAdmin';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(404);
    });
    it('should return 400 if the payload, title is less than 4 characterss', async () => {
      const role = new Role({
        title: 'cleaner'
      });

      await role.save();

      const id = role._id;
      const newTitle = 'sup';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(400);
    });
    it('should return 400 if the payload, title is less than 4 characterss', async () => {
      const role = new Role({
        title: 'cleane'
      });

      await role.save();

      const id = role._id;
      const newTitle = 'superadmins';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(400);
    });
    it('should return 400 if role already exist', async () => {
      await Role.collection.bulkWrite([{
        insertOne: {
          title: 'admins'
        }
      }, {
        insertOne: {
          title: 'regulars'
        }
      }]);

      const roleTwo = new Role({
        title: 'clean'
      });

      await roleTwo.save();

      const id = roleTwo._id;
      const newRole = 'admins';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newRole
      });
      expect(response.status).toBe(400);
    });
    it('should return 404 if the passed id is not found', async () => {
      const id = mongoose.Types.ObjectId();
      const newTitle = 'superAdm';

      const response = await request(server).put(`/api/v1/roles/${id}`).send({
        title: newTitle
      });

      expect(response.status).toBe(404);
    });
  });
  describe('GET /:id', () => {
    it('should return an existing role', async () => {
      const role = new Role({
        title: 'amate'
      });

      await role.save();

      const id = role._id;

      const response = await request(server).get(`/api/v1/roles/${id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', role.title);
    });
    it('should return 404 if an invalid id is passed', async () => {
      const id = 1;

      const response = await request(server).get(`/api/v1/roles/${id}`);

      expect(response.status).toBe(404);
    });
    it('should return 404 if no role with the Id is found', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(server).get(`/api/v1/roles/${id}`);

      expect(response.status).toBe(404);
    });
  });
});