/**
 * useStreakCheckin
 *
 * Fires a single POST /api/streak/checkin when the Study page mounts.
 * "Just starting any study session" counts as practicing for the day.
 * The call is fire-and-forget; errors are swallowed silently.
 */

import { useEffect } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useStreakCheckin() {
  useEffect(() => {
    axios.post(`${API}/streak/checkin`).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
