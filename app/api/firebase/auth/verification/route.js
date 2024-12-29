import { doc, updateDoc } from "firebase/firestore";
import { applyActionCode } from "firebase/auth";
import { db, auth } from '@/app/firebase/firebaseConfig';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    const oobCode = searchParams.get('oobCode');

    if (!uid || !oobCode) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    try {
        // Apply the action code to verify the email
        await applyActionCode(auth, oobCode);

        // Update the user document in Firestore
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isValid: true });

        // Redirect to the home page after successful verification
        return NextResponse.redirect('/');
    } catch (error) {
        console.error('Error verifying email:', error);
        return NextResponse.json({ error: 'Error verifying email' }, { status: 500 });
    }
}
