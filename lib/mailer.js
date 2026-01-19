import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendClaimEmail(to, itemName) {
  await transporter.sendMail({
    from: `"Campus Lost & Found" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your lost item has been confirmed",
    html: `
      <p>Hello,</p>

      <p>Your claim for the item <strong>${itemName}</strong> has been successfully verified.</p>

      <p>Please visit the <strong>Security Office</strong> with valid ID to collect your item.</p>

      <p>Thank you,<br/>Campus Lost & Found Team</p>
    `,
  });
}
