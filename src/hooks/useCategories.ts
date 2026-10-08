/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CategoryItem } from '../types';
import { subscribeToCategories } from '../lib/db';

export function useCategories(includeUnpublished = false) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((items) => {
      const filtered = items
        .filter((c) => !c.slug.includes('blog') && !c.label.toLowerCase().includes('blog'))
        .filter((c) => (includeUnpublished ? true : c.published));
      setCategories(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [includeUnpublished]);

  return { categories, loading };
}
