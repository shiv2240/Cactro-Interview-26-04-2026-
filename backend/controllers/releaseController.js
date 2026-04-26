const { query: pgQuery } = require('../config/db');
const { getPredefinedChecklist, calculateStatus } = require('../utils/helpers');

// @desc    Get all releases
// @route   GET /api/releases
const getReleases = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, date } = req.query;

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
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const [dataResult, countResult] = await Promise.all([
      pgQuery(`SELECT * FROM releases ${where} ORDER BY release_date DESC LIMIT $${i++} OFFSET $${i++}`, [...values, limitNum, offset]),
      pgQuery(`SELECT COUNT(*) FROM releases ${where}`, values),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: dataResult.rows,
      metadata: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
};

// @desc    Get single release
// @route   GET /api/releases/:id
const getReleaseById = async (req, res) => {
  try {
    const result = await pgQuery(`SELECT * FROM releases WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
};

// @desc    Create a release
// @route   POST /api/releases
const createRelease = async (req, res) => {
  try {
    const { name, release_date, additional_info } = req.body;
    const steps = getPredefinedChecklist();
    const status = calculateStatus(steps);

    const result = await pgQuery(
      `INSERT INTO releases (name, release_date, additional_info, status, steps)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, release_date, additional_info || '', status, JSON.stringify(steps)]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create release' });
  }
};

// @desc    Update a release
// @route   PUT /api/releases/:id
const updateRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, release_date, additional_info, steps } = req.body;
    const status = calculateStatus(steps);

    const result = await pgQuery(
      `UPDATE releases SET name=$1, release_date=$2, additional_info=$3, status=$4, steps=$5
       WHERE id=$6 RETURNING *`,
      [name, release_date, additional_info || '', status, JSON.stringify(steps), id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update release' });
  }
};

// @desc    Delete a release
// @route   DELETE /api/releases/:id
const deleteRelease = async (req, res) => {
  try {
    const result = await pgQuery(`DELETE FROM releases WHERE id = $1 RETURNING id`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Release deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete release' });
  }
};

module.exports = { getReleases, getReleaseById, createRelease, updateRelease, deleteRelease };
