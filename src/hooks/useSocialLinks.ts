/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { SocialLinkItem } from '../types';
import { subscribeToSocialLinks } from '../lib/db';

export function useSocialLinks(includeUnpublished = false) {
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToSocialLinks((items) => {
      const filtered = includeUnpublished
        ? items
        : items.filter((item) => item.published && item.url && item.url.trim().length > 0);
      setSocialLinks(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [includeUnpublished]);

  return { socialLinks, loading };
}
