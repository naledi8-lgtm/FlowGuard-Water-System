import type { Severity } from '../theme';

/**
 * These field names are the CONTRACT shared by the mobile app, the Python
 * USSD/SMS service, and the C# admin dashboard. Rename a field here and
 * you must rename it in the other two services and in firestore.rules too.
 */

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  area: string;
  lat: number;
  lng: number;
  notifyOffline: boolean; // also fan out via the USSD/SMS service
}

export interface IssueReport {
  id: string;
  reporterId: string | null;   // null when isAnonymous is true
  isAnonymous: boolean;
  category: 'leak' | 'burst_pipe' | 'no_water' | 'contamination' | 'other';
  description: string;
  photoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  manualArea?: string | null;  // set when the reporter declined location permission
  channel: 'app' | 'ussd';     // lets admins see where a report came from
  status: 'submitted' | 'in_review' | 'in_progress' | 'resolved';
  confirmCount: number;        // "X neighbours confirmed this" - see README
}

export interface UserProfile {
  uid: string;
  displayName: string;
  area: string;
  phoneNumber?: string;
  notifyBySms: boolean;
  lowDataMode: boolean;
  language: 'en' | 'af' | 'zu' | 'st';
}

export interface Supplier {
  id: string;
  name: string;
  serviceType: 'tanker_delivery' | 'bottled_water' | 'tank_sales' | 'borehole_drilling';
  areasServed: string[];
  contactPhone: string;
  contactWhatsApp?: string;
}
