export const generateAppointmentEmail = (
  patientName: string,
  appointmentDetails: any,
  justBooked = true
) => {
  const { date, doctor, specialization, subtype } = appointmentDetails;
  return `
  ${
    justBooked
      ? `<h2>Appointment Confirmation</h2>`
      : `<h2>Appointment Coming Up</h2>`
  }
    <p>Dear ${patientName},</p>
    ${justBooked ? `<p>Your appointment has been successfully booked.</p>` :  `<p>Your appointment is starting in five minutes.</p>`}
    <p><strong>Appointment Details:</strong></p>
    <ul>
      <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
      <li><strong>Doctor:</strong> ${doctor}</li>
      <li><strong>Specialization:</strong> ${specialization}</li>
      <li><strong>Appointment Type:</strong> ${subtype}</li>
    </ul>
    <p><strong>Hospital Location:</strong> Sheba Medical Center, Israel</p>
    <p>For directions, please click on the link below to get detailed navigation instructions:</p>
    <a href="https://www.google.com/maps?q=Sheba+Medical+Center,+Israel">View Directions to Sheba Hospital</a>
    <p>We look forward to seeing you!</p>
    <p>Best regards,</p>
    <p>Your Healthcare Team</p>
  `;
};
