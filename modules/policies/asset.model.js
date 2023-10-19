const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const notebookSchema = new mongoose.Schema({
  ownerAddress: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileCID: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    default: '.ipynb',
  },
},
{
  collection: 'notebooks',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toObject: {
    virtuals: true
  },
  toJson: {
    virtuals: true
  }
});

const Notebook = mongoose.model('Notebook', notebookSchema);

module.exports = Notebook;
