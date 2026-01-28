import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
        return NextResponse.json(
            { error: 'Valid email is required' },
            { status: 400 }
        );
    }

    try {
        // Prepare the subscriber data
        const subscriberData: any = {
            email: email,
        };

        // Add to group if GROUP_ID is provided
        if (process.env.MAILERLITE_GROUP_ID) {
            subscriberData.groups = [process.env.MAILERLITE_GROUP_ID];
        }

        // Send to MailerLite
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
            },
            body: JSON.stringify(subscriberData),
        });

        const data = await response.json();

        // Handle errors from MailerLite
        if (!response.ok) {
            // Check if email already exists
            if (response.status === 422) {
                return NextResponse.json(
                    { error: 'This email is already subscribed' },
                    { status: 400 }
                );
            }
            throw new Error(data.message || 'Failed to subscribe');
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed!'
        });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}