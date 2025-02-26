import express from 'express';
import {  getAvailableAppointmentsByType } from '../controllers/appointmentController';
import { jwtRequired } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/get_available_appointments_by_type',jwtRequired, getAvailableAppointmentsByType);



export default router;