import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth, applyActionCode } from "firebase/auth";
import { db, auth } from '@/app/firebase/firebaseConfig';

export default async function handler(req, res) {
    const { uid, oobCode } = req.query;

    if (!uid || !oobCode) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        // Apply the action code to verify the email
        await applyActionCode(auth, oobCode);

        // Update the user document in Firestore
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isValid: true });

        // Redirect to the home page after successful verification
        res.writeHead(302, { Location: '/' });
        res.end();
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Error verifying email' });
    }
}
