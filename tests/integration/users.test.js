import 'babel-polyfill';
import request from 'supertest';
import mongoose from 'mongoose';
import {
  User
} from '../../models/users';
import {
  Role
} from '../../models/roles';
import {
  adminToken,
  regularToken
} from './util';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import app from '../../index';

let server

describe('/api/v1/users', () => {
  beforeAll(async () => {
    server = app;
    await Role.collection.insertMany([{
      title: 'admin1'
    }, {
      title: 'regular1'
    }, ]);
  });
  beforeEach(async () => {});
  afterEach(async () => {
    await User.deleteMany({});

  });

  afterAll(async () => {
    await Role.deleteMany({});
    await User.deleteMany({});
    server.close();
  });
  describe('POST /signup', () => {
    it('should create a new user if the input field are valid', async () => {
      const payload = {
        firstname: 'Chibueze',
        lastname: 'Nathan',
        role: 'regular1',
        username: 'nachi',
        email: 'chibueze6@test.com',
        password: '12345'
      }

      const response = await request(server)
        .post('/api/v1/users/signup')
        .send(payload);

      expect(response.status).toBe(200);
    });
    it('should create not a new user if the input field are invalid', async () => {
      const payload = {
        firstname: 'Chi',
        lastname: 'Nath2an',
        role: 'regular1',
        username: 'nac2hi',
        email: 'chibu',
        password: '12345'
      }

      const response = await request(server)
        .post('/api/v1/users/signup')
        .send(payload);

      expect(response.status).toBe(400);
    });
    it('should create not a new user if the user already exist', async () => {
      const salt = await bcrypt.genSalt(10);
      const password1 = '12345';
      const hashedPassword1 = await bcrypt.hash(password1, salt);


      const payload = {
        firstname: 'Chibueze1545',
        lastname: 'Nathan1545',
        role: mongoose.Types.ObjectId(),
        username: 'nachi12675',
        email: 'chibueze323555@test.com',
        password: hashedPassword1
      };

      const user = await new User(payload);

      await user.save();

      const payload2 = {
        firstname: 'Chinwah',
        lastname: 'Natwdman',
        role: 'regular1',
        username: 'nac2hiww',
        email: 'chibueze323555@test.com',
        password: '12345'
      }

      const response = await request(server)
        .post('/api/v1/users/signup')
        .send(payload2);

      expect(response.status).toBe(400);
    });
    it('should create not a new user if the role already exist', async () => {
      const payload2 = {
        firstname: 'Chinwah',
        lastname: 'Natwdman',
        role: 'regufjf',
        username: 'nac2h323w',
        email: 'chibueze370@test.com',
        password: '12345'
      }

      const response = await request(server)
        .post('/api/v1/users/signup')
        .send(payload2);

      expect(response.status).toBe(400);
    });
  });
  describe('POST /login', () => {
    it('should login in signed up user', async () => {
      const salt = await bcrypt.genSalt(10);

      const password = '12345'
      const hashedPassword = await bcrypt.hash(password, salt);

      const payload = {
        firstname: 'Chibueze1',
        lastname: 'Nathan1',
        role: 'regular1',
        username: 'nachi1',
        email: 'chibueze1@test.com',
        password: hashedPassword
      }

      await User.collection.insertOne(payload);

      const token = await new User(payload).generateAuthToken();

      const credentials = {
        email: payload.email,
        password: password
      }

      const response = await request(server)
        .post('/api/v1/users/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.header['x-auth-token']).not.toBe(null);
    });
    it('should not login in an invalid user', async () => {
      const credentials = {
        email: 'qwerty@gmail.com',
        password: '12345'
      }

      const response = await request(server)
        .post('/api/v1/users/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.header['x-auth-token']).not.toBe(null);
    });
    it('should not login in signed up user if passwaord is not valid', async () => {
      const salt = await bcrypt.genSalt(10);

      const password = '12345'
      const hashedPassword = await bcrypt.hash(password, salt);

      const payload = {
        firstname: 'Chibueze1',
        lastname: 'Nathan1',
        role: 'regular1',
        username: 'nachi1',
        email: 'chibueze1@test.com',
        password: hashedPassword
      }

      await User.collection.insertOne(payload);

      const token = await new User(payload).generateAuthToken();

      const credentials = {
        email: payload.email,
        password: 'password'
      }

      const response = await request(server)
        .post('/api/v1/users/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.header['x-auth-token']).not.toBe(null);
    });
    it('should not login in signed up user if  valid email and password is not provided', async () => {
      const credentials = {
        email: 'jhdkdl',
        password: 'password'
      }

      const response = await request(server)
        .post('/api/v1/users/login')
        .send(credentials);

      expect(response.status).toBe(400);
    });
  });
  describe('POST /logout', () => {
    it('should logout a user', async () => {
      const token = adminToken;

      const response = await request(server)
        .post('/api/v1/users/logout')
        .set('x-auth-token', token)
        .send();

      expect(response.status).toBe(200);
      expect(response.header['x-auth-token']).toBe(undefined);
    });
  });
  describe('GET /', () => {
    it('should return all the user if user is Admin', async () => {
      const response = await request(server)
        .get('/api/v1/users')
        .set('x-auth-token', adminToken)
        .send();

      expect(response.status).toBe(200);
    });
  });
  describe('GET /:id', () => {
    it('should return a user if the user exist', async () => {
      const salt = await bcrypt.genSalt(10);
      const password1 = '12345';
      const hashedPassword1 = await bcrypt.hash(password1, salt);


      const payload = {
        firstname: 'Chibueze4',
        lastname: 'Nathan4',
        role: mongoose.Types.ObjectId(),
        username: 'nachi123',
        email: 'chibueze34@test.com',
        password: hashedPassword1
      };

      const user = await new User(payload);

      await user.save();

      const response = await request(server)
        .get(`/api/v1/users/${user._id}`)
        .set('x-auth-token', regularToken)
        .send();

      expect(response.status).toBe(200);
    });
  });
  describe('PUT /:id', () => {
    it('should update a user if the user exist', async () => {
      const salt = await bcrypt.genSalt(10);
      const password1 = '12345';
      const hashedPassword1 = await bcrypt.hash(password1, salt);


      const payload = {
        firstname: 'Chibueze54',
        lastname: 'Nathan54',
        role: mongoose.Types.ObjectId(),
        username: 'nachi1267',
        email: 'chibueze3235@test.com',
        password: hashedPassword1
      };

      const user = await new User(payload);

      await user.save();

      const response = await request(server)
        .put(`/api/v1/users/${user._id}`)
        .set('x-auth-token', regularToken)
        .send({
          firstname: 'Samuel'
        });

      expect(response.status).toBe(200);
      expect(response.body.firstname).toBe('Samuel');
    });
  });
  describe('DELETE /:id', () => {
    it('should delete a user if the user exist', async () => {
      const salt = await bcrypt.genSalt(10);
      const password1 = '12345';
      const hashedPassword1 = await bcrypt.hash(password1, salt);


      const payload = {
        firstname: 'Chibueze545',
        lastname: 'Nathan545',
        role: mongoose.Types.ObjectId(),
        username: 'nachi12675',
        email: 'chibueze32355@test.com',
        password: hashedPassword1
      };

      const user = await new User(payload);

      await user.save();

      const response = await request(server)
        .delete(`/api/v1/users/${user._id}`)
        .set('x-auth-token', regularToken)
        .send();

      expect(response.status).toBe(200);
    });
  });
});