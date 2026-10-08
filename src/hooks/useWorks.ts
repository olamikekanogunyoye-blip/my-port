/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WorkItem } from '../types';
import { subscribeToWorks } from '../lib/db';

export function useWorks(includeUnpublished = false) {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToWorks((items) => {
      const filtered = includeUnpublished ? items : items.filter((w) => w.published);
      setWorks(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [includeUnpublished]);

  return { works, loading };
}
