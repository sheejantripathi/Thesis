const mongoose = require('mongoose');
const { Schema } = mongoose;

const customPolicySchema = new Schema(
  {
    policy_id: { type: Schema.Types.ObjectId, ref: "Policy", required: true },
    assetId: { type: String, required: true },
    policy_version: { type: String, required: true},
    temporal: { type: Number, required: true },
    geo_location: String,
    data_sensitivity_level: {type: String, enum:['public','internal', 'confidential', 'classified']},
    requester_attributes: [{
      role: { type: String, required: true },
      organization: { type: String, required: true },
      organization_type: {
        type: String,
        enum: ["individual", "group"],
        required: true,
      },
      reputation: String,
      access_frequency: Number,
      data_usage: [{type: String, enum:['read-only', 'edit-only', 'full-access']}],
    }],
  },
  {
    collection: 'custom_policies',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
customPolicySchema.index({ policy_id: 1 });
customPolicySchema.index({ temporal: 1 });
customPolicySchema.index({ geo_location: 1 });
customPolicySchema.index({ "requester_attributes.role": 1 });
customPolicySchema.index({ "requester_attributes.organization": 1 });
customPolicySchema.index({ "requester_attributes.organization_type": 1 });

// Virtuals
customPolicySchema.virtual('requester_full_name').get(function () {
  return `${this.requester_attributes.organization} - ${this.requester_attributes.role}`;
});

// Pre-save hook for data validation or modifications
customPolicySchema.pre('save', function (next) {
  // Perform data validation or modifications
  next();
});

// Post-save hook for post-save processing
customPolicySchema.post('save', function (doc) {
  // Perform post-save processing
});

// Create and export the CustomPolicy model
const CustomPolicy = mongoose.model('CustomPolicy', customPolicySchema);

module.exports = CustomPolicy;
