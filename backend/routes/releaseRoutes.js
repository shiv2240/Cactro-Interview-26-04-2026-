const express = require('express');
const router = express.Router();
const {
  getReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease
} = require('../controllers/releaseController');

router.route('/')
  .get(getReleases)
  .post(createRelease);

router.route('/:id')
  .get(getReleaseById)
  .put(updateRelease)
  .delete(deleteRelease);

module.exports = router;
