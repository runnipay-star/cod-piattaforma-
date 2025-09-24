import { createClient } from '@supabase/supabase-js';
import { User } from './types';

// !!! ATTENZIONE !!!
// Sostituisci queste stringhe vuote con l'URL e la chiave anonima del tuo progetto Supabase.
// Li trovi nelle impostazioni del tuo progetto Supabase > API.
// Per un'applicazione di produzione, dovresti usare variabili d'ambiente.
const supabaseUrl = 'https://sdjmkddhlhocigqbytgk.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkam1rZGRobGhvY2lncWJ5dGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTgwMDksImV4cCI6MjA3MzY5NDAwOX0.JcyGweyeuPSmUwdHspQ1fucFx3ioHXcPtR3Z3P-vVjw';

if (!supabaseUrl || !supabaseAnonKey) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #f8d7da; color: #721c24; padding: 1rem; text-align: center; font-family: sans-serif; z-index: 9999;';
    errorDiv.innerText = "ERRORE: URL e chiave anonima di Supabase non sono impostate in supabaseClient.ts. L'applicazione non funzionerà.";
    document.body.prepend(errorDiv);
    console.error("ERRORE: URL e chiave anonima di Supabase non sono impostate in supabaseClient.ts. L'applicazione non funzionerà correttamente.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Recupera il profilo di un utente dalla tabella 'users' pubblica.
 * @param userId L'ID dell'utente (da Supabase Auth).
 * @returns Il profilo dell'utente o null se non trovato o in caso di errore.
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        // Log a more detailed error message to help with debugging
        console.error('Errore nel recuperare il profilo utente:', JSON.stringify(error, null, 2));
        return null;
    }
    return data as User;
};