import { useCallback, useEffect, useState } from 'react';
import { AppSettings, loadSettings, saveSettings } from '../storage/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({ keepAwake: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await saveSettings(updated);
    },
    [settings]
  );

  return { settings, isLoading, updateSetting };
}
