/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { subscribeToSettings, DEFAULT_SETTINGS } from '../lib/db';
import { updateSeo } from '../lib/seo';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToSettings((data) => {
      setSettings(data);
      updateSeo(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
