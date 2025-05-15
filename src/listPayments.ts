import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments, listPaymentsByCurrency } from './lib/payments';
import { IsoCurrencyCode, isoCurrencyCodeEnum } from './lib/types';

const queryStringParametersSchema = z.object({
    currency: isoCurrencyCodeEnum.optional(),
    pagesize: z.coerce.number().int().positive().max(100).optional(),
    lasttoken: z.string().max(2000).optional(),
}).nullable();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const queryStringParameters = queryStringParametersSchema.safeParse(event.queryStringParameters);

    if (!queryStringParameters.success) {
        const badRequestPayload = {
            message: 'Invalid query',
            errors: queryStringParameters.error.format(),
        };

        return buildResponse(400, badRequestPayload, { 'content-type': 'application/json' });
    }

    try {
        const currency = queryStringParameters?.data?.currency;
        const pageSize = queryStringParameters?.data?.pagesize || 50;
        const startingToken = queryStringParameters?.data?.lasttoken;
        const result = !currency ? await listPayments({ pageSize, startingToken }) : await listPaymentsByCurrency(currency as IsoCurrencyCode, { pageSize, startingToken });
        const payments = result.items;
        return buildResponse(200, { data: payments, metadata: result.metadata }, { 'content-type': 'application/json' });

    } catch (err) {
        console.error('Error fetching payments:', err);

        return buildResponse(500, { message: 'Internal server error' }, { 'content-type': 'application/json' });
    }
};
