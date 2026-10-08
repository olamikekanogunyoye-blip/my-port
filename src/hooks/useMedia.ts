/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { MediaAsset } from '../types';
import { subscribeToMedia } from '../lib/db';

export function useMedia() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToMedia((items) => {
      setMedia(items);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { media, loading };
}
