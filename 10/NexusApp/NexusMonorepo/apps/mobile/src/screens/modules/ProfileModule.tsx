import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, Avatar, Button, Input, COLORS, Separator } from '../../components/NativeComponents';

interface ProfileModuleProps {
  user: any;
  onLogout: () => void;
}

export const ProfileModule = ({ user, onLogout }: ProfileModuleProps) => {
  if (!user) return <Text>Cargando perfil...</Text>;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Mi Perfil</Text>
      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
         <Avatar initials={user.avatar || "JD"} size={80} />
         <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 12 }}>{user.fullName || "Usuario"}</Text>
         <Text style={{ color: COLORS.textMuted }}>{user.specialty || "Sin especialidad"}</Text>
         <View style={{ flexDirection: 'row', marginTop: 16, gap: 20 }}>
            <View style={{ alignItems: 'center' }}><Text style={{ fontWeight: 'bold', fontSize: 18 }}>{user.projectsCreated || 0}</Text><Text style={{ fontSize: 12 }}>Proyectos</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ fontWeight: 'bold', fontSize: 18 }}>{user.rating || 0}</Text><Text style={{ fontSize: 12 }}>Rating</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ fontWeight: 'bold', fontSize: 18 }}>${user.totalEarnings || 0}</Text><Text style={{ fontSize: 12 }}>Ganado</Text></View>
         </View>
      </Card>
  
      <Text style={{ fontSize: 18, fontWeight: '600', marginVertical: 12 }}>Editar Información</Text>
      <Card>
         <Input label="Nombre Completo" value={user.fullName || ""} />
         <Input label="Especialidad" value={user.specialty || ""} />
         <Input label="Email" value={user.email || ""} />
         <Button title="Guardar Cambios" onPress={() => alert('Guardado')} />
      </Card>

      <View style={{ marginTop: 24 }}>
        <Button title="Cerrar Sesión" variant="outline" style={{ borderColor: COLORS.danger }} onPress={onLogout} />
      </View>
    </ScrollView>
  );
};