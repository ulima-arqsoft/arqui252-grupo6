import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ViewStyle } from 'react-native';

// --- Colores del Sistema ---
export const COLORS = {
  primary: '#2563eb',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  success: '#16a34a',
  warning: '#eab308',
  danger: '#ef4444',
};

// --- Card ---
export const Card = ({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    // @ts-ignore
    <Container style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {children}
    </Container>
  );
};

// --- Badge ---
export const Badge = ({ text, variant = 'default', color }: { text: string; variant?: 'default' | 'outline' | 'secondary'; color?: string }) => {
  const bg = color ? `${color}20` : variant === 'default' ? COLORS.text : variant === 'secondary' ? '#f1f5f9' : 'transparent';
  const textColor = color || (variant === 'default' ? '#fff' : COLORS.text);
  const borderWidth = variant === 'outline' ? 1 : 0;
  
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderWidth, borderColor: COLORS.border }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
};

// --- Button ACTUALIZADO CON PROP 'SIZE' ---
export const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  size = 'default', // <--- Valor por defecto
  icon, 
  style 
}: { 
  onPress: () => void; 
  title: string; 
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success'; 
  size?: 'sm' | 'default' | 'lg'; // <--- Definición del tipo
  icon?: React.ReactNode; 
  style?: ViewStyle 
}) => {
  let bg = COLORS.primary;
  let textColor = '#fff';
  let border = 0;

  // Lógica de Variantes
  if (variant === 'outline') { bg = 'transparent'; textColor = COLORS.text; border = 1; }
  if (variant === 'ghost') { bg = 'transparent'; textColor = COLORS.textMuted; }
  if (variant === 'danger') { bg = COLORS.danger; }
  if (variant === 'success') { bg = COLORS.success; }

  // Lógica de Tamaños (Sizes)
  let paddingVertical = 12;
  let paddingHorizontal = 16;
  let fontSize = 14;

  if (size === 'sm') {
    paddingVertical = 8;
    paddingHorizontal = 12;
    fontSize = 12;
  } else if (size === 'lg') {
    paddingVertical = 14;
    paddingHorizontal = 20;
    fontSize = 16;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { 
          backgroundColor: bg, 
          borderWidth: border, 
          borderColor: COLORS.border,
          paddingVertical,       // Aplicamos padding dinámico
          paddingHorizontal 
        }, 
        style
      ]} 
      onPress={onPress}
    >
      {icon && <View style={{ marginRight: size === 'sm' ? 6 : 8 }}>{icon}</View>}
      <Text style={[styles.buttonText, { color: textColor, fontSize }]}>{title}</Text>
    </TouchableOpacity>
  );
};

// --- Input ---
export const Input = ({ 
  label, 
  placeholder, 
  multiline, 
  value, 
  onChangeText,
  style 
}: { 
  label?: string; 
  placeholder?: string; 
  multiline?: boolean; 
  value?: string; 
  onChangeText?: (t: string) => void;
  style?: ViewStyle;
}) => (
  <View style={[{ marginBottom: 16 }, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
      placeholder={placeholder}
      multiline={multiline}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={COLORS.textMuted}
    />
  </View>
);

// --- Avatar ---
export const Avatar = ({ initials, size = 40 }: { initials: string; size?: number }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={{ color: COLORS.textMuted, fontWeight: 'bold', fontSize: size * 0.4 }}>{initials}</Text>
  </View>
);

// --- Separator ---
export const Separator = () => <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 16 }} />;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  button: {
    flexDirection: 'row',
    // paddingVertical y paddingHorizontal ahora se manejan dinámicamente en el componente
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontWeight: '600' }, // fontSize ahora es dinámico
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.text,
  },
  avatar: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  }
});