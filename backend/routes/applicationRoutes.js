import { Router } from 'express';
import {
  applyJob,
  getAllApps,
  getUserApps,
  updateStatus
} from '../controllers/application.js';

import {auth} from '../middleware/authMiddleware.js';
import role from '../middleware/role.js';
import upload from '../config/multer.js';

const router = Router();

router.post(
  '/',
  auth,
  upload.single('resume'),
  applyJob
);

router.get('/my', auth, getUserApps);

router.get('/', auth, role('admin'), getAllApps);

router.put('/:id', auth, role('admin'), updateStatus);

export default router;