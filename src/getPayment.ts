import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';

const pathParametersSchema = z.object({
    id: z.string().uuid(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const pathParameters = pathParametersSchema.safeParse(event.pathParameters);

    if (!pathParameters.success) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Invalid Payment ID, please provide a UUID' }),
        };
    }

    const paymentId = pathParameters.data.id;

    try {
        const payment = await getPayment(paymentId);

        if (!payment) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Payment with id ${paymentId} not found` }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment),
        };
    } catch (err) {
        console.error('Error fetching payment:', err);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
