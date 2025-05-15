import { ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import * as payments from '../src/lib/payments';

describe('When converting ScanCommandOutput to PageResult', () => {
    it('Returns completed true when LastEvaluatedKey is undefined', () => {
        const mockScanCommandOutput: ScanCommandOutput = {
            Items: [],
            LastEvaluatedKey: undefined,
            $metadata: {},
        };
   
        const result = payments.toPageResult<string>(50, mockScanCommandOutput);

        expect(result.metadata.completed).toBe(true);
    });

    it('Returns completed true when there is no item', () => {
        const mockScanCommandOutput: ScanCommandOutput = {
            Items: [],
            LastEvaluatedKey: {},
            $metadata: {},
        };
   
        const result = payments.toPageResult<string>(50, mockScanCommandOutput);

        expect(result.metadata.completed).toBe(true);
    });

    it('Returns last token when LastEvaluatedKey has value', () => {
        const mockScanCommandOutput: ScanCommandOutput = {
            Items: [{ 'xyz': 'abc' }],
            LastEvaluatedKey: { 'xyz': 'abc' },
            $metadata: {},
        };
   
        const result = payments.toPageResult<string>(50, mockScanCommandOutput);

        expect(result.metadata.lastToken).toBeDefined();
    });

    it('Returns completed false when LastEvaluatedKey has value', () => {
        const mockScanCommandOutput: ScanCommandOutput = {
            Items: [{ 'xyz': 'abc' }],
            LastEvaluatedKey: { 'xyz': 'abc' },
            $metadata: {},
        };
   
        const result = payments.toPageResult<string>(50, mockScanCommandOutput);

        expect(result.metadata.completed).toBe(false);
    });

    it('Returns items when there are items', () => {
        const mockScanCommandOutput: ScanCommandOutput = {
            Items: [{ 'xyz': 'abc' }, { 'xyz': '123' }],
            LastEvaluatedKey: { 'xyz': 'abc' },
            $metadata: {},
        };

        const result = payments.toPageResult<string>(50, mockScanCommandOutput);

        expect(result.items).toBe(mockScanCommandOutput.Items);
    });
});