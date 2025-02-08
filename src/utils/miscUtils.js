import { customAlphabet, nanoid } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const alphanumericNanoid = customAlphabet(alphabet, 16);

// custom alphabet, alphanumeric
export const getAlphanumericId = (length = 16) => {
  return alphanumericNanoid(length);
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const validateRequiredFields = async (body, fields, reply) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return reply.code(400).send({ error: 'Fields array is empty or undefined' });
  }

  if (!body || Object.keys(body).length === 0) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Request body is empty or undefined'
    });
  }

  const missingParams = fields.reduce((acc, field) => {
    // Check for undefined, null, or empty string
    return body[field] === undefined || body[field] === null || body[field] === '' ? [...acc, field] : acc;
  }, []);

  if (missingParams.length > 0) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: `Missing parameters: ${missingParams.join(', ')}`
    });
  }

  return true;
};