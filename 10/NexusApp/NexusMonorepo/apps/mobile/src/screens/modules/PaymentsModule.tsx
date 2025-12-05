import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Button, COLORS, Separator } from '../../components/NativeComponents';
import { DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface PaymentsModuleProps {
  transactions: any[];
}

export const PaymentsModule = ({ transactions }: PaymentsModuleProps) => {
  
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Billetera</Text>
      
      <Card style={{ backgroundColor: COLORS.primary }}>
         <Text style={{ color: '#fff', opacity: 0.8 }}>Balance Disponible</Text>
         <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 8 }}>$3,247.00</Text>
         <Button title="Retirar Fondos" variant="outline" style={{ borderColor: '#fff', marginTop: 8 }} onPress={() => alert('Retiro iniciado')} />
      </Card>

      <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 12 }}>Historial</Text>
      {transactions && transactions.length > 0 ? (
        transactions.map((tx, index) => (
          <Card key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ backgroundColor: tx.amount.includes('+') ? '#dcfce7' : '#fee2e2', padding: 8, borderRadius: 8 }}>
                   {tx.amount.includes('+') ? <ArrowDownLeft size={20} color={COLORS.success} /> : <ArrowUpRight size={20} color={COLORS.danger} />}
                </View>
                <View>
                   <Text style={{ fontWeight: '600' }}>{tx.type}</Text>
                   <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{tx.project}</Text>
                </View>
             </View>
             <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: 'bold', color: tx.amount.includes('+') ? COLORS.success : COLORS.danger }}>{tx.amount}</Text>
                <Text style={{ fontSize: 10, color: COLORS.textMuted }}>{tx.date}</Text>
             </View>
          </Card>
        ))
      ) : (
        <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 20 }}>No hay transacciones recientes.</Text>
      )}
    </ScrollView>
  );
};