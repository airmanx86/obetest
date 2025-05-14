import { randomUUID } from 'crypto';

type UUID = ReturnType<typeof randomUUID>;

export type Payment = {
    id: UUID;
    amount: number;
    currency: string;
};
