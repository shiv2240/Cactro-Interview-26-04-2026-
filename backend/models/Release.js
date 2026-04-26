const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  release_date: { type: Date, required: true, index: true },
  additional_info: { type: String, default: '' },
  status: { type: String, default: 'planned', index: true },
  steps: { type: Array, default: [] }
});

// Transform _id to id in JSON response
releaseSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Release = mongoose.model('Release', releaseSchema);

module.exports = Release;
