// Auth domain types shared by store and API clients.
export interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Manager' | 'Sales' | 'Viewer';
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresIn: string;
  csrfToken: string;
  user: UserProfile;
}
