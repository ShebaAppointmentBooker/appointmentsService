import express from 'express';
import {  logoutPatient, registerPatient,refreshPatientToken, requestOtpPatient, loginPatientOtp } from '../controllers/patientController';
import { jwtRequired } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/requestotp', requestOtpPatient);
router.post('/loginotp', loginPatientOtp);
// router.post('/login', loginPatient);
router.post('/refreshtoken', refreshPatientToken);
router.post('/logout',jwtRequired, logoutPatient);


// Patient registration route
router.post('/register', async (req, res) => {
  const { name, email, password, medicalHistory } = req.body;

  try {
    await registerPatient(name, email, password, medicalHistory);
    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering patient' });
  }
});

export default router;
