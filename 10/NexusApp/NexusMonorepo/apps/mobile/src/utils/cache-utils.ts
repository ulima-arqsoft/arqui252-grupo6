import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_IDEAS_KEY = '@nexus_pending_ideas';

export interface PendingIdea {
    id: string;
    data: {
        title: string;
        category: string;
        description: string;
        budget: string;
        deliveryTime: string;
        files?: any[];
    };
    user: {
        fullName: string;
        id: string;
        avatar: string;
    };
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
}

/**
 * Save a pending idea to local storage
 */
export async function savePendingIdea(
    ideaData: PendingIdea['data'],
    user: PendingIdea['user']
): Promise<string> {
    try {
        const pendingIdeas = await getPendingIdeas();
        const newIdea: PendingIdea = {
            id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            data: ideaData,
            user: user,
            timestamp: Date.now(),
            status: 'pending',
        };

        pendingIdeas.push(newIdea);
        await AsyncStorage.setItem(PENDING_IDEAS_KEY, JSON.stringify(pendingIdeas));

        console.log('💾 Idea saved to cache:', newIdea.id);
        return newIdea.id;
    } catch (error) {
        console.error('Error saving pending idea:', error);
        throw error;
    }
}

/**
 * Get all pending ideas from local storage
 */
export async function getPendingIdeas(): Promise<PendingIdea[]> {
    try {
        const data = await AsyncStorage.getItem(PENDING_IDEAS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting pending ideas:', error);
        return [];
    }
}

/**
 * Update the status of a pending idea
 */
export async function updatePendingIdeaStatus(
    id: string,
    status: PendingIdea['status']
): Promise<void> {
    try {
        const pendingIdeas = await getPendingIdeas();
        const index = pendingIdeas.findIndex((idea) => idea.id === id);

        if (index !== -1) {
            pendingIdeas[index].status = status;
            await AsyncStorage.setItem(PENDING_IDEAS_KEY, JSON.stringify(pendingIdeas));
            console.log(`📝 Updated idea ${id} status to: ${status}`);
        }
    } catch (error) {
        console.error('Error updating pending idea status:', error);
        throw error;
    }
}

/**
 * Remove a pending idea from local storage after successful sync
 */
export async function removePendingIdea(id: string): Promise<void> {
    try {
        const pendingIdeas = await getPendingIdeas();
        const filteredIdeas = pendingIdeas.filter((idea) => idea.id !== id);
        await AsyncStorage.setItem(PENDING_IDEAS_KEY, JSON.stringify(filteredIdeas));
        console.log('✅ Removed synced idea from cache:', id);
    } catch (error) {
        console.error('Error removing pending idea:', error);
        throw error;
    }
}

/**
 * Clear all pending ideas from local storage
 */
export async function clearPendingIdeas(): Promise<void> {
    try {
        await AsyncStorage.removeItem(PENDING_IDEAS_KEY);
        console.log('🗑️ Cleared all pending ideas');
    } catch (error) {
        console.error('Error clearing pending ideas:', error);
        throw error;
    }
}

/**
 * Get count of pending ideas
 */
export async function getPendingIdeasCount(): Promise<number> {
    const ideas = await getPendingIdeas();
    return ideas.filter((idea) => idea.status === 'pending').length;
}
