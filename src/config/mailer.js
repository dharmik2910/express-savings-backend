const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ subject, html, attachments = [] }) => {
  const { data, error } = await resend.emails.send({
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: [process.env.RECEIVER_EMAIL],
    subject,
    html,
    attachments: attachments, // Added this line
  });

  // Resend returns errors instead of throwing, so throw here to make the controller respond 500
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
};

module.exports = sendMail;