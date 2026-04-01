import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJob,
  deleteJob
} from '../controllers/job.js';

import role from '../middleware/role.js';
import { auth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', auth, role('admin'), createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.delete('/:id', auth, role('admin'), deleteJob);

export default router;