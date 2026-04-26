const { Pool } = require('pg');

let pool;

const connectDB = async () => {
  try {
    // Check for standard Postgres config envs. Fallback to MONGO_URI string if user just pasted blindly there.
    let connectionString = process.env.DATABASE_URL || process.env.MONGO_URI; 
    
    // Construct connection string securely if using decoupled env structures
    if (!connectionString && process.env.DB_HOST) {
      connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    }

    if (!connectionString) {
      console.warn("No DATABASE_URL or DB_HOST found in .env. Postgres will fail to connect.");
    }

    pool = new Pool({
      connectionString,
      ssl: (connectionString && (connectionString.includes('render.com') || connectionString.includes('supabase') || connectionString.includes('neon.tech')))
           ? { rejectUnauthorized: false } 
           : false
    });

    const client = await pool.connect();
    
    console.log("PostgreSQL connected successfully.");

    // Stand up native PG Schema architecture without complex migrations!
    await client.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        release_date TIMESTAMP NOT NULL,
        additional_info TEXT,
        status VARCHAR(50) DEFAULT 'planned',
        steps JSONB DEFAULT '[]'::jsonb
      );
    `);

    // Add indexes for efficient algorithmic traversal identical to Mongoose config
    await client.query(`CREATE INDEX IF NOT EXISTS idx_releases_name ON releases (name);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_releases_status ON releases (status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_releases_date ON releases (release_date);`);

    // Backfill any rows that were created without steps (e.g. manual inserts or pre-migration rows)
    const defaultSteps = JSON.stringify([
      { id: 1, name: "All relevant GitHub pull requests have been merged", completed: false },
      { id: 2, name: "CHANGELOG.md files have been updated",               completed: false },
      { id: 3, name: "All tests are passing",                               completed: false },
      { id: 4, name: "Releases in GitHub created",                          completed: false },
      { id: 5, name: "Deployed in demo",                                    completed: false },
      { id: 6, name: "Tested thoroughly in demo",                           completed: false },
      { id: 7, name: "Deployed in production",                              completed: false },
    ]);
    const backfill = await client.query(
      `UPDATE releases SET steps = $1::jsonb WHERE steps = '[]'::jsonb OR steps IS NULL`,
      [defaultSteps]
    );
    if (backfill.rowCount > 0) {
      console.log(`Backfilled steps for ${backfill.rowCount} existing release(s).`);
    }

    client.release();
  } catch (err) {
    console.error("Error connecting to PostgreSQL:", err.message);
  }
};

const query = (text, params) => {
  if (!pool) throw new Error("Database not initialized");
  return pool.query(text, params);
};

module.exports = { connectDB, query };
