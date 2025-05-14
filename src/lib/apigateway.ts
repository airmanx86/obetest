import { APIGatewayProxyResult } from 'aws-lambda';

type HttpHeaders = { [key: string]: string; };

export const buildResponse = (statusCode: number, body: Object, headers: HttpHeaders = {}): APIGatewayProxyResult => {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            ...headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};

export const parseInput = (body: string): Object => {
    try {
        return JSON.parse(body);
    } catch (err) {
        console.error(err);
        return {};
    }
};
