import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SettingsType {
  whatsapp_number: string;
  instagram_url: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image: string;
  catalog_badge: string;
  catalog_title: string;
  catalog_subtitle: string;
  about_title: string;
  about_text: string;
}

const DEFAULT_SETTINGS: SettingsType = {
  whatsapp_number: '55011999999999',
  instagram_url: 'https://www.instagram.com/unaaurafortaleza/',
  hero_badge: 'Semijoias de Luxo',
  hero_title: 'O brilho que já existe em você.',
  hero_subtitle: 'Peças banhadas a ouro 18k com acabamento de alta joalheria. Projetadas para elevar sua aura.',
  hero_image: '',
  catalog_badge: 'Coleção Una Aura',
  catalog_title: 'Catálogo de Semijoias',
  catalog_subtitle: 'Banhadas a ouro 18k com brilho inigualável de alta joalheria. Encontre a peça ideal para exalar sua aura singular.',
  about_title: 'O Brilho que já existe em você.',
  about_text: '"Na UNA AURA, não acreditamos que as joias trazem brilho. Acreditamos que o brilho já é parte da sua essência. Nossas peças são apenas o reflexo dessa luz interior, o elo entre sua alma e sua presença no mundo."',
};

interface SettingsContextType {
  settings: SettingsType;
  loading: boolean;
  updateSetting: (key: keyof SettingsType, value: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*');
      if (error) {
        console.warn('Could not load settings from database:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const merged: SettingsType = { ...DEFAULT_SETTINGS };
        data.forEach((row) => {
          if (row.key in merged) {
            merged[row.key as keyof SettingsType] = row.value || '';
          }
        });
        setSettings(merged);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof SettingsType, value: string) => {
    // Update local state immediately for instant feedback
    setSettings((prev) => ({ ...prev, [key]: value }));

    try {
      const { error } = await supabase.from('store_settings').upsert(
        { key, value },
        { onConflict: 'key' }
      );
      if (error) {
        console.error(`Error saving setting ${key}:`, error.message);
      }
    } catch (err) {
      console.error(`Unexpected saving error for ${key}:`, err);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Set up real-time subscription for settings
    const sub = supabase
      .channel('realtime-settings-context')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
