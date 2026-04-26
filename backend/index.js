require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const releaseRoutes = require('./routes/releaseRoutes');
const { graphqlHTTP } = require('express-graphql');
const { schema, root } = require('./graphql/schema');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/releases', releaseRoutes);

// GraphQL Route
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enables the GraphiQL UI
}));

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectDB();
});
