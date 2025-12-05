import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './payment.schema';

@Controller()
export class AppController {
    constructor(@InjectModel(Transaction.name) private transactionModel: Model<Transaction>) { }

    // Create a new transaction
    @MessagePattern({ cmd: 'create_transaction' })
    async createTransaction(@Payload() data: any) {
        const transaction = new this.transactionModel({
            ...data,
            status: 'completed', // Mock: auto-complete for now
            commission: data.amount * 0.05 // 5% platform fee
        });
        return transaction.save();
    }

    // Get user transactions
    @MessagePattern({ cmd: 'get_user_transactions' })
    async getUserTransactions(@Payload() userId: string) {
        return this.transactionModel
            .find({
                $or: [{ fromUser: userId }, { toUser: userId }]
            })
            .sort({ createdAt: -1 })
            .exec();
    }

    // Get user balance
    @MessagePattern({ cmd: 'get_balance' })
    async getBalance(@Payload() userId: string) {
        const transactions = await this.transactionModel.find({
            $or: [{ fromUser: userId }, { toUser: userId }],
            status: 'completed'
        }).exec();

        let balance = 0;
        transactions.forEach(tx => {
            if (tx.toUser === userId) {
                balance += tx.amount;
            } else if (tx.fromUser === userId) {
                balance -= (tx.amount + tx.commission);
            }
        });

        return { userId, balance };
    }

    // Withdraw funds
    @MessagePattern({ cmd: 'withdraw_funds' })
    async withdrawFunds(@Payload() data: { userId: string; amount: number }) {
        const transaction = new this.transactionModel({
            type: 'withdrawal',
            amount: data.amount,
            fromUser: data.userId,
            status: 'completed',
            description: 'Withdrawal to bank account'
        });
        return transaction.save();
    }

    // Seed initial data
    @MessagePattern({ cmd: 'seed_transactions' })
    async seed() {
        const exists = await this.transactionModel.countDocuments();
        if (exists === 0) {
            await this.transactionModel.create([
                {
                    type: 'payment',
                    amount: 2500,
                    projectName: 'App Reciclaje',
                    fromUser: 'user456',
                    toUser: 'user123',
                    status: 'completed',
                    commission: 125,
                    description: 'Pago por desarrollo'
                },
                {
                    type: 'reward',
                    amount: 500,
                    projectName: 'Sistema Inventario',
                    fromUser: 'user789',
                    toUser: 'user123',
                    status: 'completed',
                    commission: 25,
                    description: 'Recompensa por prototipo'
                }
            ]);
        }
        return { status: 'ok' };
    }
}
