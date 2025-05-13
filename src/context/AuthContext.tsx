import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api.service';
import { User, UserProfile, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest } from '../types/api.types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string, newPassword2: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user credentials for testing that matches the actual API response structure
const DUMMY_USER: UserProfile = {
  user: {
    id: 1,
    username: 'martas',
    email: 'martas@example.com',
    first_name: 'Marta',
    last_name: 'Smith',
    is_staff: false
  },
  preferred_language: 'en',
  organization: null,
  is_admin: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(false); // Changed to false to use real API

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          if (isMockMode) {
            // Use dummy user for testing
            console.log("Using dummy user in mock mode:", DUMMY_USER);
            setUser(DUMMY_USER);
            setIsAuthenticated(true);
          } else {
            // Verify token and get user profile
            console.log("Verifying token and fetching user profile...");
            const isValid = await authService.verifyToken(token);
            if (isValid) {
              try {
                const userProfile = await authService.getUserProfile();
                console.log("Fetched user profile:", userProfile);
                setUser(userProfile);
                setIsAuthenticated(true);
              } catch (profileError) {
                console.error("Failed to fetch user profile:", profileError);
                // Fall back to mock user if profile fetch fails
                setUser(DUMMY_USER);
                setIsAuthenticated(true);
              }
            } else {
              // Try to refresh the token
              console.log("Token invalid, attempting refresh...");
              const refreshToken = localStorage.getItem('refresh_token');
              if (refreshToken) {
                try {
                  const response = await authService.refreshToken({ refresh: refreshToken });
                  localStorage.setItem('access_token', response.access);
                  try {
                    const userProfile = await authService.getUserProfile();
                    console.log("Fetched user profile after token refresh:", userProfile);
                    setUser(userProfile);
                    setIsAuthenticated(true);
                  } catch (profileError) {
                    console.error("Failed to fetch user profile after token refresh:", profileError);
                    // Fall back to mock user if profile fetch fails
                    setUser(DUMMY_USER);
                    setIsAuthenticated(true);
                  }
                } catch (refreshError) {
                  // Refresh token is invalid
                  console.error("Failed to refresh token:", refreshError);
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('refresh_token');
                  setIsAuthenticated(false);
                  setUser(null);
                }
              }
            }
          }
        } catch (error) {
          // Token is invalid
          console.error("Authentication error:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [isMockMode]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Check against dummy credentials
        if (username === DUMMY_USER.user.username && password === 'martas@123') {
          // Create a dummy token
          const dummyToken = 'dummy_token_' + Date.now();
          localStorage.setItem('access_token', dummyToken);
          localStorage.setItem('refresh_token', 'dummy_refresh_token');
          setUser(DUMMY_USER);
          setIsAuthenticated(true);
          return;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      const response = await authService.login({ username, password });

      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);

      // Get user profile after successful login
      const userProfile = await authService.getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail ||
        error?.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Mock registration
        await new Promise(resolve => setTimeout(resolve, 1000));

        const dummyToken = 'dummy_token_' + Date.now();
        localStorage.setItem('access_token', dummyToken);
        localStorage.setItem('refresh_token', 'dummy_refresh_token');

        const newUser: UserProfile = {
          user: {
            id: 2,
            username: data.username,
            email: data.email,
            first_name: '',
            last_name: '',
            is_staff: false
          },
          preferred_language: data.preferred_language,
          organization: null,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUser(newUser);
        setIsAuthenticated(true);
        return;
      }

      // Register the user
      await authService.register(data);

      // After registration, we need to log in
      const loginResponse = await authService.login({
        username: data.username,
        password: data.password
      });

      localStorage.setItem('access_token', loginResponse.access);
      localStorage.setItem('refresh_token', loginResponse.refresh);

      // Fetch user profile after successful login
      const userProfile = await authService.getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Handle validation errors from the API
      const errorDetails = error?.response?.data;
      let errorMessage = error?.message || 'Registration failed. Please try again.';

      if (errorDetails) {
        // Handle specific field errors
        if (errorDetails.username) {
          errorMessage = `Username: ${errorDetails.username[0]}`;
        } else if (errorDetails.email) {
          errorMessage = `Email: ${errorDetails.email[0]}`;
        } else if (errorDetails.password) {
          errorMessage = `Password: ${errorDetails.password[0]}`;
        } else if (errorDetails.confirm_password) {
          errorMessage = `Confirm password: ${errorDetails.confirm_password[0]}`;
        } else if (errorDetails.detail) {
          errorMessage = errorDetails.detail;
        } else if (errorDetails.non_field_errors) {
          errorMessage = errorDetails.non_field_errors[0];
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Update mock user
        await new Promise(resolve => setTimeout(resolve, 500));

        if (user) {
          const updatedUser = {
            ...user,
            ...data,
          };
          setUser(updatedUser);
        }
        return;
      }

      const updatedProfile = await authService.updateProfile(data);
      setUser(updatedProfile);
    } catch (error: any) {
      const errorDetails = error?.response?.data;
      let errorMessage = error?.message || 'Failed to update profile.';

      if (errorDetails) {
        if (errorDetails.email) {
          errorMessage = `Email: ${errorDetails.email[0]}`;
        } else if (errorDetails.first_name) {
          errorMessage = `First name: ${errorDetails.first_name[0]}`;
        } else if (errorDetails.last_name) {
          errorMessage = `Last name: ${errorDetails.last_name[0]}`;
        } else if (errorDetails.preferred_language) {
          errorMessage = `Language: ${errorDetails.preferred_language[0]}`;
        } else if (errorDetails.detail) {
          errorMessage = errorDetails.detail;
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string, newPassword2: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isMockMode) {
        // Mock password change
        await new Promise(resolve => setTimeout(resolve, 500));

        if (oldPassword !== 'martas@123') {
          throw new Error('Current password is incorrect');
        }

        if (newPassword !== newPassword2) {
          throw new Error('New passwords do not match');
        }

        // Simulate successful password change
        return;
      }

      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2
      });
    } catch (error: any) {
      const errorDetails = error?.response?.data;
      let errorMessage = error?.message || 'Failed to change password.';

      if (errorDetails) {
        if (errorDetails.old_password) {
          errorMessage = `Current password: ${errorDetails.old_password[0]}`;
        } else if (errorDetails.new_password) {
          errorMessage = `New password: ${errorDetails.new_password[0]}`;
        } else if (errorDetails.new_password2) {
          errorMessage = `Confirm password: ${errorDetails.new_password2[0]}`;
        } else if (errorDetails.detail) {
          errorMessage = errorDetails.detail;
        } else if (errorDetails.non_field_errors) {
          errorMessage = errorDetails.non_field_errors[0];
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      error,
      login,
      register,
      logout,
      updateProfile,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};