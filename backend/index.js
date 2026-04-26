require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const releaseRoutes = require('./routes/releaseRoutes');
const { createHandler } = require('graphql-http/lib/use/express');
const { schema, root } = require('./graphql/schema');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/releases', releaseRoutes);

// Modern GraphQL Route
app.all('/graphql', createHandler({
  schema: schema,
  rootValue: root,
}));

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectDB();
});
