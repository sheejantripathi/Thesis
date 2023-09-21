const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requesterAttributesSchema = new Schema({
  role: { type: String, required: true },
  organization: { type: String, required: true },
  reputation: String,
  access_frequency: Number,
  permissions: [{ type: String, enum: ['read-only', 'edit-only', 'full-access'] }],
  days_of_access: {type: String, required: true},
  email_filter: String,
  location_based: [{latitude: String, longitude: String}]
});

const customPolicySchema = new Schema(
  {
    policy_version: { type: String, required: true },
    assetId: { type: String, required: true },
    data_sensitivity_level: { type: String, enum: ['public', 'internal', 'confidential', 'classified'] },
    requester_attributes: [requesterAttributesSchema],
  },
  {
    collection: 'custom_policies',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('CustomPolicy', customPolicySchema);
