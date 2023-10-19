const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = require('mongoose').Types;

const requesterAttributesSchema = new Schema({
  attributes: [{
    attribute: {type: String, required: true},
    permissions: { type: String, enum: ['read_access', 'edit_access', 'unlimited_access'] },
    access_from: {type: Date},
    access_to: {type: Date},
  }],
  reputation: String,
  access_frequency: Number,
  location_based: [{latitude: String, longitude: String}]
});

const customPolicySchema = new Schema(
  {
    policy_version: { type: String, required: true },
    assetId: { type: ObjectId, ref: 'Notebook'},
    contract_details: requesterAttributesSchema,
    asset_owner: { type: String },
  },
  {
    collection: 'custom_policies',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('CustomPolicy', customPolicySchema);
