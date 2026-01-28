import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    try {
        const { name, email, subject, message } = await request.json()

        // Validate environment variables
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error('Email configuration missing')
        }

        // Configure nodemailer transporter with more robust settings
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        // Verify connection configuration
        await transporter.verify()

        const mailOptions = {
            from: process.env.GMAIL_USER, // Use your email as sender
            replyTo: email, // Set reply-to as user's email
            to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        }

        await transporter.sendMail(mailOptions)

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 })
    } catch (error) {
        console.error('Email error:', error)
        return NextResponse.json(
            { message: 'Failed to send email', error: (error as Error).message },
            { status: 500 }
        )
    }
}