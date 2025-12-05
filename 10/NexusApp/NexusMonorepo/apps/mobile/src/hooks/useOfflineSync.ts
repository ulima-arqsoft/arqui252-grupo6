import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { savePendingIdea, getPendingIdeas, removePendingIdea, updatePendingIdeaStatus } from '../utils/cache-utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-gateway-production-7a43.up.railway.app';

export const useOfflineSync = (currentUser: any, fetchIdeas: () => Promise<void>) => {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingIdeasCount, setPendingIdeasCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    // Monitor network status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected === true && state.isInternetReachable !== false;
            setIsOnline(online);

            if (online) {
                console.log('📡 Connection restored, syncing pending ideas...');
                syncPendingIdeas();
            } else {
                console.log('📴 Offline mode activated');
            }
        });

        // Load pending ideas count on mount
        updatePendingCount();

        return () => unsubscribe();
    }, []);

    // Update pending ideas count
    const updatePendingCount = async () => {
        const pending = await getPendingIdeas();
        setPendingIdeasCount(pending.filter(p => p.status === 'pending').length);
    };

    // Sync pending ideas when connection is restored
    const syncPendingIdeas = async () => {
        const pending = await getPendingIdeas();
        const pendingToSync = pending.filter(p => p.status === 'pending');

        if (pendingToSync.length === 0) return;

        setIsSyncing(true);
        console.log(`🔄 Syncing ${pendingToSync.length} pending ideas...`);

        for (const pendingIdea of pendingToSync) {
            try {
                await updatePendingIdeaStatus(pendingIdea.id, 'syncing');

                const response = await fetch(`${API_URL}/ideas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...pendingIdea.data,
                        author: pendingIdea.user.fullName,
                        authorId: pendingIdea.user.id,
                        status: 'Nueva',
                        collaborators: 0,
                        avatar: pendingIdea.user.avatar
                    }),
                });

                if (response.ok) {
                    console.log(`✅ Synced idea: ${pendingIdea.id}`);
                    await removePendingIdea(pendingIdea.id);
                } else {
                    await updatePendingIdeaStatus(pendingIdea.id, 'failed');
                    console.error(`❌ Failed to sync idea: ${pendingIdea.id}`);
                }
            } catch (error) {
                await updatePendingIdeaStatus(pendingIdea.id, 'failed');
                console.error(`❌ Error syncing idea ${pendingIdea.id}:`, error);
            }
        }

        await updatePendingCount();
        await fetchIdeas();
        setIsSyncing(false);
        console.log('✅ Sync complete');
    };

    // Publish idea with offline support
    const publishIdeaOffline = async (formData: any, originalPublishIdea: (data: any) => Promise<void>) => {
        // If offline, save to cache
        if (!isOnline) {
            await savePendingIdea(formData, {
                fullName: currentUser?.fullName || 'Usuario',
                id: currentUser?.id || 'unknown',
                avatar: currentUser?.avatar || 'U'
            });
            await updatePendingCount();
            alert('📴 Sin conexión. Tu idea se guardó y se publicará cuando vuelvas a estar en línea.');
            console.log('💾 Idea saved to cache (offline)');
            return { success: true, offline: true };
        }

        // If online, try to publish normally
        try {
            await originalPublishIdea(formData);
            return { success: true, offline: false };
        } catch (error) {
            // On error, save to cache
            await savePendingIdea(formData, {
                fullName: currentUser?.fullName || 'Usuario',
                id: currentUser?.id || 'unknown',
                avatar: currentUser?.avatar || 'U'
            });
            await updatePendingCount();
            alert('📴 Error de conexión. Tu idea se guardó y se publicará cuando vuelvas a estar en línea.');
            return { success: true, offline: true };
        }
    };

    return {
        isOnline,
        pendingIdeasCount,
        isSyncing,
        publishIdeaOffline,
        syncPendingIdeas,
        updatePendingCount
    };
};
