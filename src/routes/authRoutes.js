import fastify from "fastify";


/**
 *
 * @param {import("fastify").FastifyInstance} app
 * @param {*} _
 * @param {Function} done
 */
export const authRoutes = (app, _, done) => {
  fastify.get('/login', async (request, reply) => {
    return { hello: 'world' }
  })

  done();
}