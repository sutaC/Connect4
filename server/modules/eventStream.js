export function createEvent(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
