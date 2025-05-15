import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/listPayments';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Payment } from '../src/lib/types';

describe('When the user requests the records for a payments', () => {
    it('Returns HTTP 200 and list of payments.', async () => {
        const paymentId = randomUUID();
        const mockPayment: Payment[] = [{
            paymentId: paymentId,
            currency: 'AUD',
            amount: 2000,
        }];
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayment);

        const result = await handler({ queryStringParameters: null } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).data).toEqual(mockPayment);
        expect(listPaymentsMock).toHaveBeenCalled();
    });

    it('Returns HTTP 200 and empty array when payment is not found', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce([]);

        const result = await handler({ queryStringParameters: null } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).data).toEqual([]);
        expect(listPaymentsMock).toHaveBeenCalled();
    });

    it('Returns HTTP 500 when there is an error fetching payments from database', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPayments').mockRejectedValueOnce(new Error('Internal server error'));

        const result = await handler({ queryStringParameters: null } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ message: 'Internal server error' });
        expect(listPaymentsMock).toHaveBeenCalled();
    });
});

describe('When the user requests the records for a payments filtered by currency', () => {
    it('Returns HTTP 200 and list of payments matching the currency.', async () => {
        const paymentId = randomUUID();
        const mockPayment: Payment[] = [{
            paymentId: paymentId,
            currency: 'SGD',
            amount: 2000,
        }];
        const listPaymentsMock = jest.spyOn(payments, 'listPaymentsByCurrency').mockResolvedValueOnce(mockPayment);

        const result = await handler({
            queryStringParameters: {
                currency: 'SGD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).data).toEqual(mockPayment);
        expect(listPaymentsMock).toHaveBeenCalledWith('SGD');
    });

    it('Returns HTTP 200 and empty array when payment is not found', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPaymentsByCurrency').mockResolvedValueOnce([]);

        const result = await handler({
            queryStringParameters: {
                currency: 'USD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).data).toEqual([]);
        expect(listPaymentsMock).toHaveBeenCalledWith('USD');
    });

    it('Returns HTTP 400 when the currency query string is invalid', async () => {
        const result = await handler({
            queryStringParameters: {
                currency: 'XYZ',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toEqual({ message: 'Invalid currency' });
    });

    it('Returns HTTP 500 when there is an error fetching payments from database', async () => {
        const listPaymentsMock = jest.spyOn(payments, 'listPaymentsByCurrency').mockRejectedValueOnce(new Error('Internal server error'));

        const result = await handler({
            queryStringParameters: {
                currency: 'NZD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body)).toEqual({ message: 'Internal server error' });
        expect(listPaymentsMock).toHaveBeenCalledWith('NZD');
    });
})

afterEach(() => {
    jest.resetAllMocks();
});
