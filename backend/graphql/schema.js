const { buildSchema } = require('graphql');
const { query: pgQuery } = require('../config/db');
const { getPredefinedChecklist, calculateStatus } = require('../utils/helpers');

const schema = buildSchema(`
  type Step {
    id: Int!
    name: String!
    completed: Boolean!
  }

  type RequestMetadata {
    total: Int
    page: Int
    totalPages: Int
    limit: Int
  }

  type Release {
    id: ID!
    name: String!
    release_date: String!
    additional_info: String
    status: String!
    steps: [Step]!
  }

  type ReleasesPayload {
    data: [Release]!
    metadata: RequestMetadata!
  }

  type Query {
    releases(page: Int, limit: Int, search: String, status: String, date: String, sortDir: String): ReleasesPayload
    release(id: ID!): Release
  }

  input StepInput {
    id: Int!
    name: String!
    completed: Boolean!
  }

  type Mutation {
    createRelease(name: String!, release_date: String!, additional_info: String): Release
    updateRelease(id: ID!, name: String, release_date: String, additional_info: String, status: String, steps: [StepInput]): Release
    deleteRelease(id: ID!): Boolean
  }
`);

const formatRow = (row) => ({
  ...row,
  id: row.id.toString(),
  release_date: new Date(row.release_date).toISOString(),
  steps: Array.isArray(row.steps) ? row.steps : JSON.parse(row.steps || '[]'),
});

const root = {
  // GET /graphql  { releases(...) }
  releases: async (args) => {
    const { page = 1, limit = 10, search, status, date, sortDir = 'desc' } = args;

    const whereClauses = [];
    const values = [];
    let i = 1;

    if (search) {
      whereClauses.push(`name ILIKE $${i++}`);
      values.push(`%${search}%`);
    }
    if (status && status !== 'All') {
      whereClauses.push(`status = $${i++}`);
      values.push(status.toLowerCase());
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereClauses.push(`release_date >= $${i++} AND release_date <= $${i++}`);
      values.push(startOfDay, endOfDay);
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderDir = sortDir === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      pgQuery(
        `SELECT * FROM releases ${where} ORDER BY release_date ${orderDir} LIMIT $${i++} OFFSET $${i++}`,
        [...values, limit, offset]
      ),
      pgQuery(`SELECT COUNT(*) FROM releases ${where}`, values),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: dataResult.rows.map(formatRow),
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  // GET /graphql  { release(id) }
  release: async ({ id }) => {
    const result = await pgQuery(`SELECT * FROM releases WHERE id = $1`, [id]);
    if (result.rows.length === 0) throw new Error('Release not found');
    return formatRow(result.rows[0]);
  },

  // mutation createRelease
  createRelease: async ({ name, release_date, additional_info }) => {
    const steps = getPredefinedChecklist();
    const status = 'planned';

    const result = await pgQuery(
      `INSERT INTO releases (name, release_date, additional_info, status, steps)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, release_date, additional_info || '', status, JSON.stringify(steps)]
    );

    return formatRow(result.rows[0]);
  },

  // mutation updateRelease
  updateRelease: async ({ id, name, release_date, additional_info, steps }) => {
    const setClauses = [];
    const values = [];
    let i = 1;

    if (name !== undefined)             { setClauses.push(`name = $${i++}`);             values.push(name); }
    if (release_date !== undefined)     { setClauses.push(`release_date = $${i++}`);     values.push(release_date); }
    if (additional_info !== undefined)  { setClauses.push(`additional_info = $${i++}`);  values.push(additional_info); }
    if (steps !== undefined) {
      const newStatus = calculateStatus(steps);
      setClauses.push(`steps = $${i++}`);    values.push(JSON.stringify(steps));
      setClauses.push(`status = $${i++}`);   values.push(newStatus);
    }

    if (setClauses.length === 0) throw new Error('No fields provided to update');

    values.push(id);
    const result = await pgQuery(
      `UPDATE releases SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    if (result.rows.length === 0) throw new Error('Release not found');
    return formatRow(result.rows[0]);
  },

  // mutation deleteRelease
  deleteRelease: async ({ id }) => {
    const result = await pgQuery(`DELETE FROM releases WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) throw new Error('Release not found');
    return true;
  },
};

module.exports = { schema, root };
