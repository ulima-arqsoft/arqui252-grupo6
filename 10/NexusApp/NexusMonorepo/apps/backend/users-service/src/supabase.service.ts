import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized successfully');
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }

    // Métodos helper para usuarios
    async findAllUsers() {
        const { data, error } = await this.supabase
            .from('user')
            .select('*');

        if (error) throw error;
        return data;
    }

    async findUserById(id: string) {
        const { data, error } = await this.supabase
            .from('user')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    async createUser(userData: any) {
        const { data, error } = await this.supabase
            .from('user')
            .insert(userData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateUser(id: string, userData: any) {
        const { data, error } = await this.supabase
            .from('user')
            .update(userData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteUser(id: string) {
        const { error } = await this.supabase
            .from('user')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    // --- SUPABASE AUTH METHODS ---
    async signUp(email: string, password: string, metadata: { fullName: string; specialty: string }) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;
        return data;
    }

    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    }

    async getSession() {
        const { data, error } = await this.supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    }

    async getUser(accessToken: string) {
        const { data, error } = await this.supabase.auth.getUser(accessToken);
        if (error) throw error;
        return data.user;
    }
}
