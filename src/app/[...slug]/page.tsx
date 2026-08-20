'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import App from '@/App';

export default function CatchAllPage() {
  const params = useParams();
  const slug = params?.slug;
  const path = Array.isArray(slug) ? slug.join('/') : (slug || '');

  // Map sub-routes directly to active lab tabs
  let initialTab: any = 'home';
  if (path === 'lab' || path.startsWith('lab/')) initialTab = 'hardware_diag';
  else if (path === 'store' || path === 'services') initialTab = 'home';
  else if (path === 'b2b') initialTab = 'classy_hub';
  else if (path === 'intake') initialTab = 'intake';
  else if (path === 'hardware' || path === 'hardware_diag') initialTab = 'hardware_diag';
  else if (path === 'calc' || path === 'pricing' || path === 'estimate') initialTab = 'calc';
  else if (path === 'track' || path === 'status') initialTab = 'track';
  else if (path === 'booking' || path === 'book') initialTab = 'booking';
  else if (path === 'analytics' || path === 'telemetry') initialTab = 'analytics';
  else if (path === 'academy' || path === 'training') initialTab = 'academy';
  else if (path === 'privacy' || path === 'legal' || path === 'about') initialTab = 'about';
  else if (path === 'support' || path === 'contact') initialTab = 'support';
  else if (path === 'matrix' || path === 'board') initialTab = 'matrix';
  else if (path === 'voice' || path === 'tts') initialTab = 'eleven_tts';

  return <App initialTab={initialTab} />;
}
