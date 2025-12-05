// apps/backend/payments-service/src/payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
    // Transaction type
    @Prop({
        required: true,
        enum: ['reward', 'payment', 'withdrawal', 'commission']
    }) type: string;

    // Amount
    @Prop({ required: true }) amount: number;

    // Project reference
    @Prop() projectId: string;
    @Prop() projectName: string;

    // Users involved
    @Prop({ required: true }) fromUser: string; // User ID
    @Prop() toUser: string; // User ID (optional for withdrawals)

    // Status
    @Prop({
        default: 'pending',
        enum: ['pending', 'completed', 'failed', 'cancelled']
    }) status: string;

    // Commission (Nexus platform fee)
    @Prop({ default: 0 }) commission: number;

    // Description
    @Prop() description: string;

    // Payment method (mock for now)
    @Prop() paymentMethod: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
