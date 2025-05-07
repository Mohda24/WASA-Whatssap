import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './FireBaseConfig';

export async function verifyLicense(key) {
    try {
        // 1. Find the license
        const q = query(collection(db, "licenses"), where("key", "==", key));
        const snapshot = await getDocs(q);
        console.log("Query snapshot size:", snapshot.size);
        
        if (snapshot.empty) {
            console.log("License not found");
            return false;
        }
        
        console.log("License found:", snapshot.docs[0].data());
        const licenseData = snapshot.docs[0].data();
        const licenseId = snapshot.docs[0].id;
        
        // 2. Only update if valid & unused
        if (licenseData.valid && !licenseData.used) {
            // 3. Update ONLY the 'used' field
            const licenseRef = doc(db, "licenses", licenseId);
            await updateDoc(licenseRef, { used: true });
            console.log("License marked as used successfully");
            return true;
        } else {
            console.log("License is either invalid or already used");
            return false;
        }
    } catch (error) {
        console.error("Firestore error:", error);
        return false;
    }
}

export async function resetLicenseKey(key) {
    try {
        const q = query(
            collection(db, "licenses"),
            where("key", "==", key)
        );
        console.log("Querying Firestore to reset key:", key);

        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);

        if (querySnapshot.empty) {
            console.log("No license found for key:", key);
            return false; // Key not found
        }

        const docRef = querySnapshot.docs[0].ref; // Reference to the doc
        const docData = querySnapshot.docs[0].data();

        console.log("License document data:", docData);

        // Reset the license to unused state
        await updateDoc(docRef, { used: false });
        console.log("License marked as unused/reset.");
        return true;
    } catch (error) {
        console.error("Error resetting license key:", error);
        return false;
    }
}