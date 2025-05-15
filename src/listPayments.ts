import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments, listPaymentsByCurrency } from './lib/payments';
import { IsoCurrencyCode, isoCurrencyCodeEnum } from './lib/types';

const queryStringParametersSchema = z.object({
    currency: isoCurrencyCodeEnum.optional(),
}).nullable();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryStringParameters = queryStringParametersSchema.safeParse(event.queryStringParameters);

    if (!queryStringParameters.success) {
        return buildResponse(400, { message: 'Invalid currency' }, { 'content-type': 'application/json' });
    }

    try {
        const currency = queryStringParameters?.data?.currency;
        const payments = !currency ? await listPayments() : await listPaymentsByCurrency(currency as IsoCurrencyCode);
        return buildResponse(200, { data: payments }, { 'content-type': 'application/json' });

    } catch (err) {
        console.error('Error fetching payments:', err);

        return buildResponse(500, { message: 'Internal server error' }, { 'content-type': 'application/json' });
    }
};
