import React, { useState, useEffect } from 'react';
import { processIdeaFiles } from '../../utils/idea-helpers';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Badge, Button, Input, Separator, Avatar, COLORS } from '../../components/NativeComponents';
import { ArrowLeft, Clock, Users, DollarSign, Paperclip, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';

interface IdeasModuleProps {
  ideas: any[];
  actions: any;
  state: any;
}

export const IdeasModule = ({ ideas, actions, state }: IdeasModuleProps) => {
  // --- ESTADOS LOCALES PARA EL FORMULARIO ---
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deliveryTime: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery.trim()) {
        actions.searchIdeas(localSearchQuery);
      } else {
        actions.clearSearch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled && result.assets) {
        setSelectedFiles([...selectedFiles, ...result.assets]);
      }
    } catch (err) {
      console.log('Error picking document:', err);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

const handlePublish = async () => {
  try {
    // Process files before publishing
    const processedData = await processIdeaFiles(
      {
        ...form,
        files: selectedFiles.map(f => ({
          name: f.name,
          type: f.mimeType,
          size: f.size,
          uri: f.uri
        }))
      },
      state.currentUser?.id || 'user123'
    );
    // Publish with uploaded file URLs
    actions.publishIdea(processedData);
    
    // Reset form
    setForm({ title: '', category: '', description: '', budget: '', deliveryTime: '' });
    setSelectedFiles([]);
  } catch (error) {
    console.error('Error publishing idea:', error);
    alert('Error al publicar la idea');
  }
};

  // --- 1. ESTADO DE CARGA ---
  if (state.loading && !state.showPublishForm && !state.showCheckout && !state.selectedIdea) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.textMuted }}>Cargando ideas...</Text>
      </View>
    );
  }

  // --- 2. PANTALLA: FORMULARIO DE PUBLICAR ---
  if (state.showPublishForm) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Button 
          title="Volver" 
          variant="ghost" 
          icon={<ArrowLeft size={16} color={COLORS.text} />} 
          onPress={() => actions.togglePublishForm(false)} 
          style={{ alignSelf: 'flex-start', marginBottom: 10 }} 
        />
        <Text style={styles.headerTitle}>Publicar Idea</Text>
        <Card>
          <Input 
            label="Título del Proyecto" 
            placeholder="Ej: App de Reciclaje" 
            value={form.title}
            onChangeText={(t) => handleChange('title', t)}
          />
          <Input 
            label="Categoría" 
            placeholder="Tecnología, Salud..." 
            value={form.category}
            onChangeText={(t) => handleChange('category', t)}
          />
          <Input 
            label="Descripción Detallada" 
            placeholder="Describe el problema y la solución..." 
            multiline 
            value={form.description}
            onChangeText={(t) => handleChange('description', t)}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input 
                label="Presupuesto (USD)" 
                placeholder="2500" 
                value={form.budget}
                onChangeText={(t) => handleChange('budget', t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input 
                label="Tiempo" 
                placeholder="2 meses" 
                value={form.deliveryTime}
                onChangeText={(t) => handleChange('deliveryTime', t)}
              />
            </View>
          </View>

          <Text style={styles.label}>Archivos Adjuntos</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {selectedFiles.map((file, index) => (
              <View key={index} style={styles.fileBadge}>
                <Text style={styles.fileText} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeFile(index)}>
                  <X size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addFileButton} onPress={handlePickDocument}>
              <Paperclip size={16} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary, fontSize: 12, marginLeft: 4 }}>Adjuntar</Text>
            </TouchableOpacity>
          </View>

          <Button 
            title="Publicar Proyecto" 
            variant="success" 
            onPress={handlePublish} 
          />
        </Card>
      </ScrollView>
    );
  }

  // --- 3. PANTALLA: CHECKOUT (PAGO) ---
  if (state.showCheckout && state.selectedIdea) {
    const idea = state.selectedIdea;
    // Limpieza básica del precio para calcular el total
    const priceNumber = idea.budget ? parseInt(idea.budget.replace(/\D/g, '')) || 0 : 0;
    const total = priceNumber + 125; 
    
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
         <Button 
           title="Cancelar" 
           variant="ghost" 
           icon={<ArrowLeft size={16} color={COLORS.text} />} 
           onPress={() => actions.toggleCheckout(false)} 
           style={{ alignSelf: 'flex-start' }} 
         />
         <Text style={styles.headerTitle}>Confirmar Colaboración</Text>
         
         <Card>
           <Text style={styles.subHeader}>Resumen del Pedido</Text>
           <View style={styles.rowBetween}><Text>Proyecto</Text><Text style={{fontWeight:'bold'}}>{idea.title}</Text></View>
           <View style={styles.rowBetween}><Text>Presupuesto</Text><Text>{idea.budget}</Text></View>
           <View style={styles.rowBetween}><Text>Comisión Nexus</Text><Text>$125</Text></View>
           <Separator />
           <View style={styles.rowBetween}><Text style={styles.bigPrice}>Total</Text><Text style={styles.bigPrice}>${total}</Text></View>
         </Card>

         <Card>
           <Text style={styles.subHeader}>Método de Pago</Text>
           <Input label="Número de Tarjeta" placeholder="0000 0000 0000 0000" />
           <View style={{ flexDirection: 'row', gap: 10 }}>
             <View style={{ flex: 1 }}><Input label="MM/AA" placeholder="12/25" /></View>
             <View style={{ flex: 1 }}><Input label="CVV" placeholder="123" /></View>
           </View>
           <Button 
             title={`Pagar $${total}`} 
             variant="success" 
             icon={<DollarSign size={16} color="#fff"/>} 
             onPress={() => { alert('Pago procesado correctamente'); actions.toggleCheckout(false); }} 
           />
         </Card>
      </ScrollView>
    );
  }

  // --- 4. PANTALLA: DETALLE DE IDEA ---
  if (state.selectedIdea) {
    const idea = state.selectedIdea;
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Button 
          title="Volver" 
          variant="ghost" 
          icon={<ArrowLeft size={16} color={COLORS.text} />} 
          onPress={() => actions.selectIdea(null)} 
          style={{ alignSelf: 'flex-start' }} 
        />
        
        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <Avatar initials={idea.avatar || 'U'} size={50} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{idea.title}</Text>
              <Text style={styles.textMuted}>por {idea.author} {idea.authorRating ? `• ⭐ ${idea.authorRating}` : ''}</Text>
            </View>
          </View>
          
          <Text style={styles.bodyText}>{idea.fullDescription || idea.description}</Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
             {idea.skills?.map((s: string, index: number) => <Badge key={index} text={s} variant="secondary" />)}
          </View>

          {/* Mostrar archivos adjuntos si existen */}
          {idea.files && idea.files.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.label, { marginBottom: 8 }]}>Archivos Adjuntos</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {idea.files.map((file: any, index: number) => (
                  <View key={index} style={styles.fileBadge}>
                    <Paperclip size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.fileText} numberOfLines={1}>{file.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.textMuted}><Clock size={14} color={COLORS.textMuted}/> Entrega</Text>
            <Text>{idea.deliveryTime || 'No especificado'}</Text>
          </View>
          <Separator />
          <View style={styles.rowBetween}>
            <Text style={styles.textMuted}><Users size={14} color={COLORS.textMuted}/> Interesados</Text>
            <Text>{idea.collaborators || 0}</Text>
          </View>
          <Separator />
          <View style={styles.rowBetween}>
            <Text style={styles.bigPrice}>{idea.budget}</Text>
            <Badge text={idea.status} color={COLORS.success} />
          </View>
          
          <View style={{ marginTop: 20, gap: 10 }}>
            <Button title="Colaborar Ahora" onPress={() => actions.toggleCheckout(true)} />
            <Button title="Contactar Cliente" variant="outline" onPress={() => actions.navigateToModule('messages')} />
          </View>
        </Card>
      </ScrollView>
    );
  }

  // --- 5. PANTALLA: LISTA DE IDEAS (DEFAULT) ---
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.rowBetween}>
        <Text style={styles.headerTitle}>Explorar Ideas</Text>
        <Button title="Publicar" size="sm" onPress={() => actions.togglePublishForm(true)} />
      </View>

      <Input 
        placeholder="Buscar por tecnología, categoría..." 
        value={localSearchQuery}
        onChangeText={setLocalSearchQuery}
      />

      {state.isSearching && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>Buscando...</Text>
        </View>
      )}

      {localSearchQuery && !state.isSearching && state.searchResults.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>
          No se encontraron resultados para "{localSearchQuery}"
        </Text>
      )}

      {(() => {
        const displayIdeas = localSearchQuery ? state.searchResults : ideas;
        
        if (!state.isSearching && displayIdeas.length === 0 && !localSearchQuery) {
          return (
            <Text style={{ textAlign: 'center', marginTop: 40, color: COLORS.textMuted }}>
              No hay ideas disponibles. ¡Sé el primero en publicar!
            </Text>
          );
        }

        return displayIdeas.map((idea: any) => {
          // Compatibilidad: Usamos _id (Mongo) o id (Mock)
          const uniqueId = idea._id || idea.id;
          
          if (!uniqueId) return null;

          return (
            <Card key={uniqueId} onPress={() => actions.selectIdea(uniqueId)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Badge text={idea.category || 'General'} variant="outline" />
                <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>{idea.budget}</Text>
              </View>
              <Text style={[styles.cardTitle, { marginTop: 8 }]}>{idea.title}</Text>
              <Text style={styles.bodyText} numberOfLines={2}>{idea.description}</Text>
              <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center' }}>
                 <Avatar initials={idea.avatar || 'U'} size={24} />
                 <Text style={[styles.textMuted, { marginLeft: 8, fontSize: 12 }]}>{idea.author}</Text>
                 {idea.files && idea.files.length > 0 && (
                   <Paperclip size={14} color={COLORS.textMuted} style={{ marginLeft: 'auto' }} />
                 )}
              </View>
            </Card>
          );
        });
      })()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  subHeader: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  textMuted: { color: COLORS.textMuted, fontSize: 14 },
  bodyText: { color: COLORS.text, fontSize: 14, lineHeight: 22, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  bigPrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: COLORS.text },
  fileBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border },
  fileText: { fontSize: 12, color: COLORS.text, marginRight: 6, maxWidth: 100 },
  addFileButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed' }
});