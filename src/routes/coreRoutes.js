import { prismaQuery } from '../../lib/prisma.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateRequiredFields } from '../utils/miscUtils.js';

/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const coreRoutes = (app, _, done) => {
 
  done();
}