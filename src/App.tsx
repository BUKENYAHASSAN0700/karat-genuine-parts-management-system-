/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InertiaProvider } from './context/InertiaContext';
import { AppLayout } from './components/Layout/AppLayout';

export default function App() {
  return (
    <InertiaProvider>
      <AppLayout />
    </InertiaProvider>
  );
}
