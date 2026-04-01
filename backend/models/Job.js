import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type:{type: String, enum: ['full-time', 'part-time', 'contract',"remote","internship"]},
  salary: String,
  description: String,
  skills: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

export default Job;