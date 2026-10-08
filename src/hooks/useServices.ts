/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ServiceItem } from '../types';
import { subscribeToServices } from '../lib/db';

const isExcluded = (title: string) => {
  const t = (title || '').toLowerCase();
  return (
    t.includes('blog') ||
    t.includes('content writing') ||
    t.includes('social media')
  );
};

export function useServices(includeUnpublished = false) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToServices((items) => {
      const filtered = items
        .filter((s) => !isExcluded(s.title))
        .filter((s) => (includeUnpublished ? true : s.published));
      setServices(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [includeUnpublished]);

  return { services, loading };
}
