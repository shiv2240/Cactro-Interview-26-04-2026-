const { buildSchema } = require('graphql');
const Release = require('../models/Release');
const { getPredefinedChecklist, calculateStatus } = require('../utils/helpers');

// GraphQL Schema exactly mirroring our Mongoose Architecture
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

// The root provides a resolver function for each API endpoint
const root = {
  releases: async (args) => {
    const { page = 1, limit = 10, search, status, date, sortDir = 'desc' } = args;
    const query = {};

    if (search) query.name = { $regex: search, $options: 'i' };
    if (status && status !== 'All') query.status = status.toLowerCase();

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.release_date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (page - 1) * limit;
    const sortValue = sortDir === 'asc' ? 1 : -1;

    const [releases, total] = await Promise.all([
      Release.find(query).sort({ release_date: sortValue }).skip(skip).limit(limit),
      Release.countDocuments(query)
    ]);

    return {
      data: releases.map(r => {
        r.id = r._id.toString(); // Map _id for GraphQL
        if (r.release_date) r.release_date = r.release_date.toISOString();
        return r;
      }),
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  },

  release: async ({ id }) => {
    const release = await Release.findById(id);
    if (!release) throw new Error('Release not found');
    release.id = release._id.toString();
    release.release_date = release.release_date.toISOString();
    return release;
  },

  createRelease: async ({ name, release_date, additional_info }) => {
    const newRelease = new Release({
      name,
      release_date,
      additional_info,
      steps: getPredefinedChecklist(),
      status: 'planned'
    });

    const saved = await newRelease.save();
    saved.id = saved._id.toString();
    saved.release_date = saved.release_date.toISOString();
    return saved;
  },

  updateRelease: async (args) => {
    const { id, name, release_date, additional_info, steps } = args;
    const updates = { name, release_date, additional_info, steps };

    if (steps) {
      updates.status = calculateStatus(steps);
    }

    const updatedRelease = await Release.findByIdAndUpdate(
      id,
      updates,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedRelease) throw new Error('Release not found');
    updatedRelease.id = updatedRelease._id.toString();
    updatedRelease.release_date = updatedRelease.release_date.toISOString();
    return updatedRelease;
  },

  deleteRelease: async ({ id }) => {
    const deleted = await Release.findByIdAndDelete(id);
    if (!deleted) throw new Error('Release not found');
    return true; // Successfully deleted
  }
};

module.exports = { schema, root };
