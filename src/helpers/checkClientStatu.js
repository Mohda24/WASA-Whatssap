export function checkClientStatus(client) {
    if (!client) {
        return { ready: false, error: 'Client not initialized' };
    }
    
    if (!client.info) {
        return { ready: false, error: 'Client not authenticated' };
    }
    
    return { ready: true };
}