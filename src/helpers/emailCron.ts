import cron from "node-cron";
import { transporter } from "../tools/mailer";
import { generateAppointmentEmail } from "../helpers/emailConstructorPatient";
export const scheduleAppointmentReminder = (appointment: any, patient: any) => {
  // Calculate the time for 5 minutes before the appointment
  const reminderTime = new Date(appointment.date);
  reminderTime.setMinutes(reminderTime.getMinutes() - 5);

  // Set up cron job to run at the reminder time
  const cronTime = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${
    reminderTime.getMonth() + 1
  } *`; // Format as cron expression

  cron.schedule(cronTime, async () => {
    try {
      if (patient && patient.email) {
        const emailContent = generateAppointmentEmail(
          patient.name,
          {
            date: appointment.date,
            doctor: appointment.doctor.name,
            specialization: appointment.type.name,
            subtype: appointment.subtype.name,
          },
          false
        );

        // Send the reminder email
        await transporter.sendMail({
          from: "liorhospitalfake@gmx.com",
          to: patient.email,
          subject: "Your Appointment is Coming Up!",
          html: emailContent,
        });
      }
    } catch (error) {
      console.error("Error sending reminder email:", error);
    }
  });
};
