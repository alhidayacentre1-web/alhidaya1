export type GraduationStatus = 'pending' | 'graduated' | 'revoked';
export type Gender = 'male' | 'female';

export interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  certificate_number: string | null;
  graduation_year: number | null;
  graduation_status: GraduationStatus;
  gender: Gender;
  photo_url: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface SchoolSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin';
}
