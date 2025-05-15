import { randomUUID } from 'crypto';
import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { Payment, isoCurrencyCodeEnum } from './lib/types';
import { createPayment } from './lib/payments';

const createPaymentRequestSchema = z.object({
    amount: z.number().positive(),
    currency: isoCurrencyCodeEnum,
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const body = createPaymentRequestSchema.safeParse(parseInput(event.body || '{}'));

    if (!body.success) {
        const unprocessableContentPayload = {
            message: 'Invalid payment request',
            errors: body.error.format(),
        };

        return buildResponse(422, unprocessableContentPayload, { 'content-type': 'application/json' });
    }

    const newPaymentId = randomUUID();

    const payment: Payment  = {
        paymentId: newPaymentId,
        amount: body.data.amount,
        currency: body.data.currency,
    };

    try {
        await createPayment(payment);
        return buildResponse(201, { result: payment.paymentId }, { 'content-type': 'application/json' });
    } catch (err) {
        console.error('Error creating payment:', err);
        return buildResponse(500, { message: 'Internal server error' }, { 'content-type': 'application/json' });
    }
};
