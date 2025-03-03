import express from 'express';
import {  getAvailableAppointmentsByType,getAllAppointmentTypes,getAllSpecializations,bookAppointment,cancelAppointment,getUserAppointments, getDoctorsBySpecialization,getPatientAppointments } from '../controllers/appointmentController';
import { jwtRequired } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/get_all_appointment_types',jwtRequired, getAllAppointmentTypes);
router.get('/get_all_specializations',jwtRequired, getAllSpecializations);
router.get('/get_user_appointments',jwtRequired, getUserAppointments);

router.post('/get_doctors_by_specialization',jwtRequired, getDoctorsBySpecialization);
router.post('/get_available_appointments_by_type',jwtRequired, getAvailableAppointmentsByType);
router.post('/get_patient_appointments',jwtRequired, getPatientAppointments);
router.post('/book_appointment',jwtRequired, bookAppointment);
router.post('/cancel_appointment',jwtRequired, cancelAppointment);


export default router;