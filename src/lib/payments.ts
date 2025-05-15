import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, DynamoDBDocumentPaginationConfiguration , paginateScan, ScanCommandInput, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { Payment, IsoCurrencyCode, PagingInfo, PageResult } from './types';
import { base64Encode, base64Decode } from './utils';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'PaymentsTable',
            Key: { paymentId },
        })
    );

    return (result.Item as Payment) || null;
};

export function toPageResult<T>(pageSize: number, result?: ScanCommandOutput) {
    const hasItemsInResult = (result?.Items?.length || 0) > 0;
    const hasMore = !!result?.LastEvaluatedKey && hasItemsInResult;

    const pageResult: PageResult<T> = {
        items: result?.Items as T[],
        metadata: {
            pageSize,
            lastToken: hasMore ? base64Encode(result.LastEvaluatedKey) : undefined,
            completed: !hasMore,
        }
    };

    return pageResult;
}

async function listInternal<T>(scanInput: ScanCommandInput, pagingInfo?: PagingInfo) {
    let startingKey = pagingInfo?.startingToken;
    let pageSize = pagingInfo?.pageSize || 50;

    const paginatorConfig: DynamoDBDocumentPaginationConfiguration = {
        client: DocumentClient,
        pageSize,
        startingToken: startingKey ? base64Decode(startingKey) : undefined,
    };

    const paginator = paginateScan(paginatorConfig, scanInput);
    const page = await paginator.next();
    return toPageResult<T>(pageSize, page.value);
}

export const listPayments = async (pagingInfo?: PagingInfo): Promise<PageResult<Payment>> => {
    return await listInternal<Payment>({ TableName: 'PaymentsTable' }, pagingInfo);
};

export const listPaymentsByCurrency = async (currency: IsoCurrencyCode, pagingInfo?: PagingInfo): Promise<PageResult<Payment>> => {
    const scanInput: ScanCommandInput = {
        TableName: 'PaymentsTable',
        FilterExpression: '#currency = :currency',
        ExpressionAttributeNames: { '#currency': 'currency'},
        ExpressionAttributeValues: {
            ':currency': currency,
        },
    };

    return await listInternal<Payment>(scanInput, pagingInfo);
};

export const createPayment = async (payment: Payment) => {
    await DocumentClient.send(
        new PutCommand({
            TableName: 'PaymentsTable',
            Item: payment,
        })
    );
};
