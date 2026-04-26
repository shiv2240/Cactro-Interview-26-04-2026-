import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

const executeGraphQL = async (query, variables = {}) => {
  const { data } = await api.post('/graphql', {
    query,
    variables
  });
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return { data: data.data };
};

export const getReleases = async (params = {}) => {
  const query = `
    query GetReleases($page: Int, $limit: Int, $search: String, $status: String, $date: String) {
      releases(page: $page, limit: $limit, search: $search, status: $status, date: $date) {
        data {
          id
          name
          release_date
          status
        }
        metadata {
          totalPages
        }
      }
    }
  `;
  
  const response = await executeGraphQL(query, params);
  // Match original REST shape returning { data: { data: [...], metadata: {...} } } mapped directly
  return { data: response.data.releases };
};

export const getRelease = async (id) => {
  const query = `
    query GetRelease($id: ID!) {
      release(id: $id) {
        id
        name
        release_date
        additional_info
        status
        steps {
          id
          name
          completed
        }
      }
    }
  `;
  const response = await executeGraphQL(query, { id });
  return { data: response.data.release };
};

export const createRelease = async (data) => {
  const query = `
    mutation CreateRelease($name: String!, $release_date: String!, $additional_info: String) {
      createRelease(name: $name, release_date: $release_date, additional_info: $additional_info) {
        id
      }
    }
  `;
  const response = await executeGraphQL(query, data);
  return { data: response.data.createRelease };
};

export const updateRelease = async (id, data) => {
  const query = `
    mutation UpdateRelease($id: ID!, $name: String, $release_date: String, $additional_info: String, $status: String, $steps: [StepInput]) {
      updateRelease(id: $id, name: $name, release_date: $release_date, additional_info: $additional_info, status: $status, steps: $steps) {
        id
        status
      }
    }
  `;
  
  // Format steps array cleanly for graphQL inputs, stripping __typename if apollo was ever used
  const steps = data.steps ? data.steps.map(s => ({
    id: parseInt(s.id),
    name: s.name,
    completed: s.completed
  })) : null;

  const variables = {
    id,
    name: data.name,
    release_date: data.release_date,
    additional_info: data.additional_info,
    status: data.status,
    steps
  };

  const response = await executeGraphQL(query, variables);
  return { data: response.data.updateRelease };
};

export const deleteRelease = async (id) => {
  const query = `
    mutation DeleteRelease($id: ID!) {
      deleteRelease(id: $id)
    }
  `;
  await executeGraphQL(query, { id });
  return { status: 200 };
};
