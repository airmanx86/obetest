import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { getPayment } from './lib/payments';

const pathParametersSchema = z.object({
    id: z.string().uuid(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const pathParameters = pathParametersSchema.safeParse(event.pathParameters);

    if (!pathParameters.success) {
        return buildResponse(400, { message: 'Invalid Payment ID, please provide a UUID' }, { 'content-type': 'application/json' });
    }

    const paymentId = pathParameters.data.id;

    try {
        const payment = await getPayment(paymentId);

        if (!payment) {
            return buildResponse(404, { message: `Payment with id ${paymentId} not found` }, { 'content-type': 'application/json' });
        }

        return buildResponse(200, payment, { 'content-type': 'application/json' });
    } catch (err) {
        console.error('Error fetching payment:', err);

        return buildResponse(500, { message: 'Internal server error' }, { 'content-type': 'application/json' });
    }
};
