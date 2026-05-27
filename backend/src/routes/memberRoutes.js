import express from 'express';
import { 
  getMembers, 
  getMember, 
  createMember, 
  updateMember, 
  deleteMember, 
  renewMembership, 
  activateMember, 
  deactivateMember 
} from '../controllers/memberController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Shield all member scopes behind JWT auth protect
router.use(protect);

router.route('/')
  .get(getMembers)
  .post(createMember);

router.route('/:id')
  .get(getMember)
  .put(updateMember)
  .delete(deleteMember);

router.post('/:id/renew', renewMembership);
router.patch('/:id/activate', activateMember);
router.patch('/:id/deactivate', deactivateMember);

export default router;
