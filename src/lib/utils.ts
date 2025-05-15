export function base64Encode(input?: Object) {
    return Buffer.from(JSON.stringify(input), 'binary').toString('base64');
}

export function base64Decode<T>(input: string): T {
    return JSON.parse(Buffer.from(input, 'base64').toString('binary')) as T;
}