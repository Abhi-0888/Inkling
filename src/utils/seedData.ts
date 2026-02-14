import { supabase } from '@/lib/supabase';
import { mockInstitutes, mockPosts } from '@/data/mockData';

export const seedDatabase = async () => {
  try {
    console.log('Seeding database with initial data...');

    // Check if institutes already exist
    const { data: existingInstitutes } = await supabase
      .from('institutes')
      .select('id')
      .limit(1);

    if (!existingInstitutes || existingInstitutes.length === 0) {
      // Insert institutes
      const { error: institutesError } = await supabase
        .from('institutes')
        .insert(mockInstitutes);

      if (institutesError) {
        console.error('Error seeding institutes:', institutesError);
      } else {
        console.log('Successfully seeded institutes');
      }
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Call this function when the app loads to ensure basic data exists
export const ensureBasicData = async () => {
  try {
    const { data: institutes } = await supabase
      .from('institutes')
      .select('id')
      .limit(1);

    if (!institutes || institutes.length === 0) {
      await seedDatabase();
    }
  } catch (error) {
    console.error('Error checking basic data:', error);
  }
};