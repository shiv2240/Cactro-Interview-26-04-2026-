require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const releaseRoutes = require('./routes/releaseRoutes');
const { createHandler } = require('graphql-http/lib/use/express');
const { schema, root } = require('./graphql/schema');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Rate Limiting - Basic protection against abuse
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/graphql', limiter);
app.use('/api', limiter);

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
