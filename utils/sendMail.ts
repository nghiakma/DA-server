import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

interface EmailOptions {

    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}

export const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        secure: false,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    const { email, subject, template, data } = options;

    // Đưa PDATH vào tệp mẫu email
    const templatePath = path.join(__dirname, '../mails', template);

    // Hiển thị mẫu email với EJS
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
};



export const sendMailCertificate = async (options: EmailOptions): Promise<void> => {
    let browser: Browser | null = null;
    browser = await puppeteer.launch({ headless: true }); // Đặt headless là true nếu không cần thấy trình duyệt
    const [page] = await browser.pages();
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        secure: false,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const { email, subject, template, data } = options;

    // Đưa PDATH vào tệp mẫu email
    const templatePath = path.join(__dirname, '../mails', template);

    // Hiển thị mẫu email với EJS
    const html: string = await ejs.renderFile(templatePath, data);

    await page.setContent(html);

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html,
    };

    try {
        await transporter.sendMail({
            ...mailOptions, 
            attachments: [
                {
                    filename: 'send-certification.pdf',
                    //   content: pdf, // Đính kèm PDF đã tạo
                    contentType: 'application/pdf', // Định dạng nội dung,
                    content: pdf as any,
                    headers: {
                        "Content-Disposition": "attachment; filename=send-certification.pdf" // Sử dụng dấu ":" thay vì ","
                    }
                }
            ] 
        });
    } catch (error) {
        console.log(error);
    }
};