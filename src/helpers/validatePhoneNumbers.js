export async function validatePhoneNumbers(client, numbers) {
    const validNumbers = [];
    const invalidNumbers = [];
    
    for (const number of numbers) {
        try {
            const cleanNumber = number.number.replace(/\D/g, '');
            const phoneNumber = cleanNumber + '@c.us';
            const numberId = await client.getNumberId(phoneNumber);
            
            if (numberId) {
                validNumbers.push({
                    ...number,
                    validatedNumber: numberId._serialized
                });
            } else {
                invalidNumbers.push({
                    ...number,
                    error: 'Not found on WhatsApp'
                });
            }
        } catch (error) {
            invalidNumbers.push({
                ...number,
                error: error.message
            });
        }
        
        // Small delay to avoid rate limiting during validation
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return { validNumbers, invalidNumbers };
}