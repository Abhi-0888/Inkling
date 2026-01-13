import { supabase } from '@/lib/supabase';

// Sample dark desire confessions for seeding
const sampleConfessions = [
  {
    content: "I've had a crush on my study partner for 3 months now but I'm too scared to say anything. Every time our hands accidentally touch when passing notes, my heart skips a beat. 💔",
    section: 'dark_desire',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "I pretend to study at the library just to see that cute barista at the campus coffee shop. I've probably spent $500 on lattes I don't even like. Worth it? Maybe. 😅☕",
    section: 'dark_desire',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "Confession: I write love poems about someone in my Psychology class and post them anonymously on the campus poetry board. They'll never know it's about them. 📝💕",
    section: 'dark_desire',
    visibility: 'global',
    kind: 'text'
  },
  {
    content: "I matched with my ex's roommate on a dating app and we've been secretly talking for weeks. The drama potential is killing me but I can't stop. 🙈🔥",
    section: 'dark_desire',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "Sometimes I go to campus events alone hoping I'll randomly bump into my crush and have a 'movie moment'. It hasn't happened yet but a person can dream. ✨",
    section: 'dark_desire',
    visibility: 'global',
    kind: 'text'
  },
  {
    content: "I have a whole Pinterest board dedicated to wedding ideas with someone who doesn't know I exist. We've only spoken once. In line for coffee. I said 'excuse me'. 💍😭",
    section: 'dark_desire',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "I changed my entire workout schedule just to be at the gym the same time as them. Three months later, still no conversation, but my gains are looking great. 💪🏃",
    section: 'dark_desire',
    visibility: 'global',
    kind: 'text'
  },
  {
    content: "I know their coffee order, their class schedule, and their Spotify playlist by heart. We're basically soulmates, they just don't know it yet. 🎵☕",
    section: 'dark_desire',
    visibility: 'campus',
    kind: 'text'
  }
];

const sampleFeedPosts = [
  {
    content: "Anyone else feeling like finals week is just a social experiment to see how much coffee a human can consume? 😅☕",
    section: 'feed',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "Hot take: The library at 2 AM has better vibes than any club. Change my mind. 📚✨",
    section: 'feed',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "PSA: The dining hall cookies are actually good today. This is not a drill. 🍪",
    section: 'feed',
    visibility: 'campus',
    kind: 'text'
  },
  {
    content: "Why do professors think 8 AM classes are a good idea? Who hurt them? 😴",
    section: 'feed',
    visibility: 'global',
    kind: 'text'
  }
];

export const seedDarkDesirePosts = async (userId: string) => {
  try {
    console.log('Seeding dark desire posts...');
    
    // Check if there are already posts
    const { data: existingPosts, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('section', 'dark_desire')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // Only seed if no posts exist
    if (!existingPosts || existingPosts.length === 0) {
      const postsToInsert = sampleConfessions.map(post => ({
        ...post,
        author_id: userId
      }));
      
      const { error } = await supabase
        .from('posts')
        .insert(postsToInsert);
      
      if (error) throw error;
      console.log('Dark desire posts seeded successfully');
    } else {
      console.log('Dark desire posts already exist, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding dark desire posts:', error);
  }
};

export const seedFeedPosts = async (userId: string) => {
  try {
    console.log('Seeding feed posts...');
    
    // Check if there are already posts
    const { data: existingPosts, error: checkError } = await supabase
      .from('posts')
      .select('id')
      .eq('section', 'feed')
      .limit(1);
    
    if (checkError) throw checkError;
    
    // Only seed if no posts exist
    if (!existingPosts || existingPosts.length === 0) {
      const postsToInsert = sampleFeedPosts.map(post => ({
        ...post,
        author_id: userId
      }));
      
      const { error } = await supabase
        .from('posts')
        .insert(postsToInsert);
      
      if (error) throw error;
      console.log('Feed posts seeded successfully');
    } else {
      console.log('Feed posts already exist, skipping seed');
    }
  } catch (error) {
    console.error('Error seeding feed posts:', error);
  }
};

export const seedDatabase = async (userId?: string) => {
  try {
    console.log('Seeding database with initial data...');
    if (userId) {
      await seedDarkDesirePosts(userId);
      await seedFeedPosts(userId);
    }
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Call this function when the app loads to ensure basic data exists
export const ensureBasicData = async (userId?: string) => {
  try {
    if (userId) {
      await seedDatabase(userId);
    }
    console.log('Basic data check completed');
  } catch (error) {
    console.error('Error checking basic data:', error);
  }
};
