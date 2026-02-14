import { supabase } from '@/lib/supabase';
import { Institute } from '@/lib/supabase';

export const instituteService = {
  async getInstitutes(): Promise<Institute[]> {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching institutes:', error);
      return [];
    }
  },

  async getInstituteById(id: string): Promise<Institute | null> {
    try {
      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching institute:', error);
      return null;
    }
  },

  async findInstituteByEmail(email: string): Promise<Institute | null> {
    try {
      const domain = email.split('@')[1];
      if (!domain) return null;

      const { data, error } = await supabase
        .from('institutes')
        .select('*')
        .contains('domain_patterns', [domain])
        .eq('active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding institute by email:', error);
      return null;
    }
  },

  async verifyEmailDomain(email: string): Promise<{ valid: boolean; institute?: Institute }> {
    try {
      const institute = await this.findInstituteByEmail(email);
      return {
        valid: !!institute,
        institute: institute || undefined
      };
    } catch (error) {
      console.error('Error verifying email domain:', error);
      return { valid: false };
    }
  }
};