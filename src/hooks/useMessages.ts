/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ContactMessage } from '../types';
import { subscribeToMessages } from '../lib/db';

export function useMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((items) => {
      setMessages(items);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { messages, loading };
}
