import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNexusController } from '../hooks/useNexusController';
import { COLORS } from '../components/NativeComponents';
import { Target, Users, Lightbulb, MessageSquare, CreditCard } from 'lucide-react-native';

// Importar Módulos
import { IdeasModule } from './modules/IdeasModule';
import { MessagesModule } from './modules/MessagesModule';
import { ProfileModule } from './modules/ProfileModule';
import { PaymentsModule } from './modules/PaymentsModule';

// Dashboard Simple (Home)
const DashboardHome = ({ actions, ideas }: { actions: any, ideas: any[] }) => (
  <ScrollView contentContainerStyle={{ padding: 16 }}>
    <Text style={{ fontSize: 28, fontWeight: 'bold', color: COLORS.primary }}>Hola, 👋</Text>
    <Text style={{ color: COLORS.textMuted, marginBottom: 24 }}>Explora las últimas novedades</Text>
    
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
       <TouchableOpacity style={[styles.dashCard, { backgroundColor: '#dbeafe' }]} onPress={() => actions.navigateToModule('ideas')}>
          <Lightbulb color={COLORS.primary} size={32} />
          <Text style={styles.dashCardTitle}>Explorar</Text>
          <Text>{ideas.length} Ideas</Text>
       </TouchableOpacity>
       <TouchableOpacity style={[styles.dashCard, { backgroundColor: '#dcfce7' }]} onPress={() => actions.navigateToModule('messages')}>
          <MessageSquare color={COLORS.success} size={32} />
          <Text style={styles.dashCardTitle}>Mensajes</Text>
          <Text>Chat</Text>
       </TouchableOpacity>
    </View>

    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Recientes</Text>
    {ideas.length === 0 ? (
      <Text style={{ color: COLORS.textMuted }}>No hay ideas recientes.</Text>
    ) : (
      ideas.slice(0, 5).map((idea, index) => (
        <TouchableOpacity key={index} style={styles.recentCard} onPress={() => { actions.selectIdea(idea.id || idea._id); actions.navigateToModule('ideas'); }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{idea.title}</Text>
          <Text numberOfLines={1} style={{ color: COLORS.textMuted, marginBottom: 8 }}>{idea.description}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: '600' }}>{idea.category}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{idea.author}</Text>
          </View>
        </TouchableOpacity>
      ))
    )}
  </ScrollView>
);

interface DashboardProps {
  state: any;
  actions: any;
}

export const NexusDashboardScreen = ({ state, actions }: DashboardProps) => {
  const renderContent = () => {
    switch (state.activeModule) {
      case 'dashboard': return <DashboardHome actions={actions} ideas={state.ideas} />;
      case 'ideas': return <IdeasModule ideas={state.ideas} actions={actions} state={state} />;
      case 'messages': return <MessagesModule chats={state.chats} user={state.currentUser} actions={actions} />;
      case 'payments': return <PaymentsModule transactions={state.transactions} />;
      case 'users': return <ProfileModule user={state.currentUser} onLogout={actions.logout} />;
      default: return <DashboardHome actions={actions} ideas={state.ideas} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      {!state.selectedIdea && !state.showCheckout && !state.showPublishForm && (
        <View style={styles.tabBar}>
          {[
            { id: 'dashboard', icon: Target, label: 'Inicio' },
            { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
            { id: 'messages', icon: MessageSquare, label: 'Chat' },
            { id: 'payments', icon: CreditCard, label: 'Pagos' },
            { id: 'users', icon: Users, label: 'Perfil' },
          ].map((tab) => (
            <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => actions.navigateToModule(tab.id as any)}>
              <tab.icon color={state.activeModule === tab.id ? COLORS.primary : COLORS.textMuted} size={24} />
              <Text style={[styles.tabText, { color: state.activeModule === tab.id ? COLORS.primary : COLORS.textMuted }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 20, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, marginTop: 4, fontWeight: '600' },
  dashCard: { width: '48%', padding: 20, borderRadius: 16, gap: 8 },
  dashCardTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  recentCard: { marginBottom: 12, padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }
});