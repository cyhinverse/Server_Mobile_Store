import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: process.env.SMTP_SECURE === 'true',
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content (optional)
 */
export const sendEmail = async (options) => {
	try {
		const mailOptions = {
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Email sent successfully:', result.messageId);
		return result;
	} catch (error) {
		console.error('Error sending email:', error.message);
		throw error;
	}
};
