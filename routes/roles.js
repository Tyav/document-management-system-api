import {
  roleController
} from '../controllers/index';
import express from 'express';
import {
  validateObjectId,
  auth,
  isAdmin
} from '../middlewares/index';

const router = express.Router();

/**
 * @swagger
 * /api/v1/roles:
 *    get:
 *      summary: returns all roles.
 *      tags: [/api/v1/roles]
 *      description: This should return all roles
 *      parameters:
 *        - in: header
 *          name: x-auth-token
 *      responses:
 *        200:
 *          description: A list of role
 *          schema:
 *            type: string
 *        400:
 *          description: Failed Request
 *          schema:
 *          type: string
 *        401:
 *          description: Unauthorized
 *          schema:
 *          type: string
 *        403:
 *          description: User no an Admin 
 *          schema:
 *          type: string 
 *        404:
 *          description: Could not find a type with the given ID 
 *          schema:
 *          type: string
 */
router.get('/', [auth, isAdmin], roleController.get);

/**
 * @swagger
 * /api/v1/roles:
 *    post:
 *      summary: creates a new role.
 *      tags: [/api/v1/roles]
 *      consumes:
 *        - application/json
 *      description: This should create a new role
 *      parameters:
 *        - in: body
 *          name: New Role
 *          description: new role
 *          schema:
 *            type: object
 *            required: true
 *            properties:
 *              title:
 *                type: string
 *                example: teachers
 *        - in: header
 *          name: x-auth-token
 *          description: admin's token
 *      responses:
 *        200:
 *          description: Role created successfully
 *          schema:
 *            type: string
 *        400:
 *          description: Could not create the role
 *          schema:
 *            type: string
 *        401:
 *          description: Unauthorized 
 *          schema:
 *          type: string
 *        403:
 *          description: User no an Admin 
 *          schema:
 *          type: string 
 *        404:
 *          description: Could not find a type with the given ID 
 *          schema:
 *          type: string
 */
router.post('/', [auth, isAdmin], roleController.post);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *    put:
 *      summary: updates the role.
 *      tags: [/api/v1/roles]
 *      consumes:
 *        - application/json
 *      description: This should update an existing role
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The ID of the role to edit.
 *        - in: body
 *          name: Document role
 *          description: new role title
 *          schema:
 *            type: object
 *            required: true
 *            properties:
 *              title:
 *                type: string
 *                example: teachers
 *        - in: header
 *          name: x-auth-token
 *          description: An authorization token
 *      responses:
 *        200:
 *          description: role updated successfully
 *          schema:
 *            type: string
 *        400:
 *          description: Could not update the role
 *          schema:
 *            type: string
 *        401:
 *          description: Unauthorized
 *          schema:
 *            type: string
 *        403:
 *          description: Unauthorized
 *          schema:
 *          type: string
 *        404:
 *          description: Could not find  a role with the given ID 
 *          schema:
 *            type: string
 */
router.put('/:id', [validateObjectId, auth, isAdmin], roleController.put);

/**
 * @swagger
 * /api/v1/roles/{id}:
 *    get:
 *      summary: returns a unique document type with the passed id
 *      tags: [/api/v1/roles]
 *      consumes:
 *        - application/json
 *      description: This should return an existing role with the given id
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The ID of the role requested.
 *        - in: header
 *          name: x-auth-token
 *          description: An authorization token
 *      responses:
 *        200:
 *          description:  success
 *          schema:
 *            type: string
 *        400:
 *          description: Invalid ID
 *          schema:
 *            type: string
 *        404:
 *          description: Could not find  a role with the given ID 
 *          schema:
 *            type: string
 */
router.get('/:id', [validateObjectId, auth, isAdmin], roleController.getById);

export {
  router as rolesRouter
};
