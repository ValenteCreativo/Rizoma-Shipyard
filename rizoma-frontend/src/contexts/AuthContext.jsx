import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Try to load as provider first
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (providerData) {
        setProfile({ ...providerData, role: 'provider' });
        setLoading(false);
        return;
      }

      // Try to load as buyer
      const { data: buyerData } = await supabase
        .from('buyer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (buyerData) {
        setProfile({ ...buyerData, role: 'buyer' });
        setLoading(false);
        return;
      }

      // No profile found - new user
      setProfile({ role: 'pending' });
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Store additional metadata
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const createProviderProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .insert([{ ...profileData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setProfile({ ...data, role: 'provider' });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const createBuyerProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('buyer_profiles')
        .insert([{ ...profileData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setProfile({ ...data, role: 'buyer' });
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    createProviderProfile,
    createBuyerProfile,
    isAuthenticated: !!user,
    isProvider: profile?.role === 'provider',
    isBuyer: profile?.role === 'buyer',
    isPending: profile?.role === 'pending'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
