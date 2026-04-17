import express from 'express';
import { addCrop, getAllCrops, getFarmerCrops, verifyCrop, deleteCrop, claimCrop } from '../controllers/cropController.js';
import { protect, authorizeRoles, protectOptional } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add-crop', protect, authorizeRoles('Farmer'), addCrop);
router.get('/all-crops', protectOptional, getAllCrops); // Buyers and everyone can see verified crops; Agents see pending too
router.get('/farmer-crops', protect, authorizeRoles('Farmer'), getFarmerCrops);
router.put('/:id/verify', protect, authorizeRoles('Agent'), verifyCrop);
router.put('/:id/claim', protect, authorizeRoles('Agent'), claimCrop);
router.delete('/:id', protect, authorizeRoles('Farmer', 'Admin'), deleteCrop);

export default router;
