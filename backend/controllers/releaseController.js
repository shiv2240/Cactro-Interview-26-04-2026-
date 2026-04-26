const Release = require('../models/Release');
const { getPredefinedChecklist, calculateStatus } = require('../utils/helpers');

// @desc    Get all releases
// @route   GET /api/releases
const getReleases = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, date } = req.query;

    const query = {};

    // Search by name (case insensitive regex)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by status (exact match)
    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    // Filter by date (exact match for the day)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.release_date = { $gte: startOfDay, $lte: endOfDay };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel
    const [releases, total] = await Promise.all([
      Release.find(query).sort({ release_date: -1 }).skip(skip).limit(limitNum),
      Release.countDocuments(query)
    ]);

    res.json({
      data: releases,
      metadata: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      }
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
    const { id } = req.params;
    const release = await Release.findById(id);
    if (!release) return res.status(404).json({ error: 'Not found' });
    res.json(release);
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

    const release = new Release({
      name,
      release_date,
      additional_info,
      status,
      steps
    });

    const savedRelease = await release.save();
    res.status(201).json(savedRelease);
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

    // Calculate new status based on updated steps
    const status = calculateStatus(steps);

    const updatedRelease = await Release.findByIdAndUpdate(
      id,
      { name, release_date, additional_info, status, steps },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedRelease) return res.status(404).json({ error: 'Not found' });
    res.json(updatedRelease);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update release' });
  }
};

// @desc    Delete a release
// @route   DELETE /api/releases/:id
const deleteRelease = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRelease = await Release.findByIdAndDelete(id);
    if (!deletedRelease) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Release deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete release' });
  }
};

module.exports = {
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease
};
