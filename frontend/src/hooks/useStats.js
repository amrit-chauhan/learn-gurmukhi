/**
 * useStats
 *
 * Fetches /api/stats once on mount.
 * Returns the stats object (null while loading).
 * Used by pages that only need to display stats (no mutations).
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API}/stats`)
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return stats;
}
