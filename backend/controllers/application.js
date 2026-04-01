import Application from '../models/Application.js';

export const applyJob = async (req, res) => {
  try {
    const alreadyApplied = await Application.findOne({
  user: req.user.id,
  job: req.body.jobId
});

if (alreadyApplied) {
  return res.status(400).json({ msg: "Already applied" });
}    
    const app = await Application.create({
      user: req.user.id,
      job: req.body.jobId,
      resume: "uploads/"+ req.file?.filename, 
    });

    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getUserApps = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);

    if (!app) {
      return res.status(404).json({ msg: "Application not found" });
    }

    app.status = req.body.status;
    await app.save();

    res.json(app);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllApps = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate('user', 'name email')
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};