import * as payments from '../src/lib/payments';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests to create a payment', () => {
    it('Returns HTTP 201 and the payment ID', async () => {
        const mockPayment = {
            currency: 'AUD',
            amount: 2000,
        };

        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

        const result = await handler({
            body: JSON.stringify(mockPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(201);
        const responseBody = JSON.parse(result.body) as { result: string };
        expect(responseBody.result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

        expect(createPaymentMock).toHaveBeenCalledWith({
            paymentId: responseBody.result,
            ...mockPayment
        });
    });

    it('Returns HTTP 422 and an error message if the currency is invalid', async () => {
        const mockPayment = {
            currency: 'XYZ',
            amount: 1000,
        };
        const result = await handler({
            body: JSON.stringify(mockPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ message: 'Invalid payment request' });
    });

    it('Returns HTTP 422 and an error message if the amount is invalid', async () => {
        const mockPayment = {
            currency: 'USD',
            amount: -100,
        };
        const result = await handler({
            body: JSON.stringify(mockPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(422);
        expect(JSON.parse(result.body)).toEqual({ message: 'Invalid payment request' });
    });

    it('Returns HTTP 500 and an error message if the payment creation fails', async () => {
        const mockPayment = {
            currency: 'SGD',
            amount: 3000,
        };

        jest.spyOn(payments, 'createPayment').mockRejectedValueOnce(new Error('Failed to create payment'));

        const result = await handler({
            body: JSON.stringify(mockPayment),
        } as unknown as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ message: 'Internal server error' });
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
