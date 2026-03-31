export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;       
  description: string;
  salary?: string;
  createdBy: string;
  createdAt: string;
}

export interface Application {
  _id: string;
  user: User | string;
  job: Job | string;
  resume?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}
