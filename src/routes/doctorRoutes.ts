import express from 'express';
import {  logoutDoctor, registerDoctor,refreshDoctorToken, requestOtpDoctor, loginDoctorOtp } from '../controllers/doctorController';
import { jwtRequired } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/requestotp', requestOtpDoctor);
router.post('/loginotp', loginDoctorOtp);
// router.post('/login', loginDoctor);
router.post('/refreshtoken', refreshDoctorToken);
router.post('/logout',jwtRequired, logoutDoctor);

// Doctor registration route
router.post('/register', async (req, res) => {
  const { name, email, password, specialization } = req.body;

  try {
    await registerDoctor(name, email, password, specialization);
    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering doctor' });
  }
});

export default router;