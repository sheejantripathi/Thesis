const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = require('mongoose').Types;

const requesterAttributesSchema = new Schema({
  role: { type: String, required: true },
  EOA_address: {type: String, required: true},
  organization: { type: String, required: true },
  reputation: String,
  access_frequency: Number,
  permissions: [{ type: String, enum: ['read-only', 'edit-only', 'full-access'] }],
  access_from: {type: Date},
  access_to: {type: Date},
  email_filter: String,
  location_based: [{latitude: String, longitude: String}]
});

const customPolicySchema = new Schema(
  {
    policy_version: { type: String, required: true },
    assetId: { type: String, required: true },
    data_sensitivity_level: { type: String, enum: ['public', 'internal', 'confidential', 'classified'] },
    fileHash: {type: String, required: true},
    requester_attributes: [requesterAttributesSchema],
    asset_owner: { type: ObjectId, ref: 'User' },
  },
  {
    collection: 'custom_policies',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('CustomPolicy', customPolicySchema);
