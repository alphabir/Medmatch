
export enum UrgencyLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export interface AnalysisResult {
  urgency: UrgencyLevel;
  specialty: string;
  explanation: string;
  nextSteps: string[];
  isEmergency: boolean;
  isUnsure?: boolean;
  followUpQuestions?: string[];
}

export interface UserInput {
  symptoms: string;
  duration?: string;
  severity?: number;
  ageGroup?: string;
  onset?: string;
  existingConditions?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Booking {
  id: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TriageHistoryItem {
  id: string;
  date: string;
  symptoms: string;
  result: AnalysisResult;
}

export interface User {
  id: string;
  name: string;
  email: string;
  ageGroup?: string;
  bookings: Booking[];
  history: TriageHistoryItem[];
}
