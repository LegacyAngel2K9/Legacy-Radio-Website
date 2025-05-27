const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.NODE_ENV === 'production' ? true : false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        this.templatesDir = path.resolve(__dirname, '../templates/emails');

        // Configure EJS to use absolute paths
        ejs.fileLoader = (filePath) => {
            return fs.readFile(path.join(this.templatesDir, filePath), 'utf8');
        };

        // Verify connection configuration
        this.verifyConnection();
    }


    async renderTemplate(templateName, data) {
        try {
            const templatePath = path.join(this.templatesDir, `${templateName}.ejs`);
            const templateContent = await fs.readFile(templatePath, 'utf8');

            // Add default body variable if using the baseTemplate structure
            if (!data.body) {
                data.body = '';
            }

            return ejs.render(templateContent, data, {
                root: this.templatesDir,
                filename: templatePath
            });
        } catch (error) {
            console.error('Template rendering error:', {
                template: templateName,
                error: error.message,
                resolvedPath: path.join(this.templatesDir, `${templateName}.ejs`)
            });
            throw error;
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info('Email server connection verified');
        } catch (error) {
            logger.error('Error verifying email server connection:', error);
            throw new Error('Email server connection failed');
        }
    }

    async sendEmail(options) {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        if (options.attachments) {
            mailOptions.attachments = options.attachments;
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${options.to}: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    async sendVerificationEmail(email, token, name) {
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

            // First render the inner content
            const bodyContent = await this.renderTemplate('verificationContent', {
                name,
                verificationUrl,
                appName: process.env.APP_NAME
            });

            // Then render the full email with base template
            const html = await this.renderTemplate('baseTemplate', {
                subject: 'Verify Your Email Address',
                actionUrl: verificationUrl,
                appName: process.env.APP_NAME,
                appUrl: process.env.FRONTEND_URL,
                logoUrl: `${process.env.FRONTEND_URL}/assets/images/logo.png`,
                body: bodyContent  // Pass the rendered content as body
            });

            await this.transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: email,
                subject: 'Verify Your Email Address',
                html: html
            });

            return true;
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }


    // async sendVerificationEmail(email, token, name) {
    //     try {
    //         const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    //         const html = await this.renderTemplate('verificationEmail', {
    //             name,
    //             verificationUrl,
    //             actionUrl: verificationUrl,
    //             appName: process.env.APP_NAME,
    //             appUrl: process.env.FRONTEND_URL,
    //             logoUrl: `${process.env.FRONTEND_URL}/assets/images/logo.png`,
    //         });

    //         // Make sure html is a string, not a Promise
    //         if (typeof html !== 'string') {
    //             throw new Error('Rendered template is not a string');
    //         }

    //         await this.transporter.sendMail({
    //             from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    //             to: email,
    //             subject: 'Verify Your Email Address',
    //             html: html
    //         });

    //         return true;
    //     } catch (error) {
    //         console.error('Error sending verification email:', error);
    //         throw error;
    //     }
    // }

}

module.exports = new EmailService();