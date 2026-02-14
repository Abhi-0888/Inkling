import { supabase } from '@/integrations/supabase/client';

export interface MatchCandidate {
  id: string;
  display_name?: string;
  gender?: string;
  bio?: string;
  interests?: string[];
  grad_year?: number;
  avatar_color?: string;
  avatar_icon?: string;
  prompts?: { question: string; answer: string }[];
  verification_status?: string;
  unpopular_opinion?: string;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  match_type?: string;
  unread_count?: number;
  last_message?: string;
  other_user?: {
    id: string;
    display_name: string;
    avatar_color: string;
    avatar_icon: string;
  };
}

const AVATAR_COLORS = [
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-red-500 to-orange-500',
];

const PROMPTS = [
  "My simple pleasure is...",
  "I'm overly competitive about...",
  "My unpopular opinion is...",
  "Two truths and a lie...",
  "The way to my heart is...",
  "I bet you can't...",
];

export const matchingService = {
  async getCandidates(): Promise<MatchCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get current user's gender and verification status
      const { data: currentUser } = await supabase
        .from('users')
        .select('gender, verification_status')
        .eq('id', user.id)
        .maybeSingle();

      if (!currentUser) {
        console.warn('User profile not found yet');
        return [];
      }

      if (currentUser.verification_status !== 'verified') {
        return [];
      }

      if (!currentUser?.gender) {
        return [];
      }

      // Browse all other verified users (no gender filter)
      // Get users excluding current user and already matched users
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user_a_id, user_b_id')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`);

      const matchedUserIds = new Set(
        (existingMatches || []).flatMap(m => [m.user_a_id, m.user_b_id]).filter(id => id !== user.id)
      );

      // Query users table - RLS restricts access appropriately
      const { data: users, error } = await supabase
        .from('users')
        .select('id, display_name, gender, verification_status, bio, class_of_year, interests, unpopular_opinion')
        .neq('id', user.id)
        .eq('verification_status', 'verified')
        .limit(50);

      if (error) {
        console.error('Error querying users:', error);
        return [];
      }

      // Filter out already matched users
      const availableUsers = (users || []).filter(u => !matchedUserIds.has(u.id));

      // Return candidates with real user information
      return availableUsers.map((user: any, index) => {
        const idSum = user.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const colorIndex = idSum % AVATAR_COLORS.length;

        return {
          id: user.id,
          display_name: user.display_name || 'Anonymous',
          gender: user.gender,
          verification_status: user.verification_status || 'verified',
          bio: user.bio || undefined,
          interests: user.interests || undefined,
          grad_year: user.class_of_year || undefined,
          avatar_color: AVATAR_COLORS[colorIndex],
          avatar_icon: 'user',
          unpopular_opinion: user.unpopular_opinion || undefined,
          prompts: user.unpopular_opinion ? [{ question: "My unpopular opinion is...", answer: user.unpopular_opinion }] : undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  },

  async swipe(candidateId: string, direction: 'like' | 'pass'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (direction === 'like') {
        // Check if the other user already liked this user (mutual match)
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('*')
          .or(`and(user_a_id.eq.${candidateId},user_b_id.eq.${user.id}),and(user_a_id.eq.${user.id},user_b_id.eq.${candidateId})`)
          .maybeSingle();

        if (!existingMatch) {
          // Create a new match - representing that current user liked the candidate
          const { error } = await supabase
            .from('matches')
            .insert({
              user_a_id: user.id,
              user_b_id: candidateId
            });
          
          if (error) {
            console.error('Error creating match:', error);
            throw error;
          }

          // Check if candidate has also liked the current user (mutual match)
          const { data: mutualMatch } = await supabase
            .from('matches')
            .select('*')
            .eq('user_a_id', candidateId)
            .eq('user_b_id', user.id)
            .maybeSingle();

          if (mutualMatch) {
            return true; // It's a mutual match!
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error processing swipe:', error);
      return false;
    }
  },

  async likeUser(candidateId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if I already liked them
      const { data: myLikeToThem } = await supabase
        .from('matches')
        .select('*')
        .eq('user_a_id', user.id)
        .eq('user_b_id', candidateId)
        .maybeSingle();

      // Check if they already liked me
      const { data: theirLikeToMe } = await supabase
        .from('matches')
        .select('*')
        .eq('user_a_id', candidateId)
        .eq('user_b_id', user.id)
        .maybeSingle();

      // If I haven't liked them yet, create the like
      if (!myLikeToThem) {
        const { error } = await supabase
          .from('matches')
          .insert({
            user_a_id: user.id,
            user_b_id: candidateId
          });
        
        if (error) {
          console.error('Error creating match:', error);
          throw error;
        }
      }

      // Return true if they liked me (creating a mutual match)
      return !!theirLikeToMe;
    } catch (error) {
      console.error('Error liking user:', error);
      return false;
    }
  },

  async getMatches(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get all matches where the user is involved
      const { data: userMatches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchesError) throw matchesError;

      // For each match, check if there's a mutual match (both users liked each other)
      const mutualMatches: Match[] = [];
      const processedPairs = new Set<string>();

      for (const match of userMatches || []) {
        const otherUserId = match.user_a_id === user.id ? match.user_b_id : match.user_a_id;
        const pairKey = [user.id, otherUserId].sort().join('-');

        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        // Check if there's a reverse match (mutual like)
        const { data: reverseMatch } = await supabase
          .from('matches')
          .select('*')
          .or(`and(user_a_id.eq.${otherUserId},user_b_id.eq.${user.id}),and(user_a_id.eq.${user.id},user_b_id.eq.${otherUserId})`)
          .limit(2);

        // If there are 2 matches (one in each direction), it's a mutual match
        if (reverseMatch && reverseMatch.length >= 2) {
          // Fetch other user's details
          const { data: otherUser } = await supabase
            .from('users')
            .select('display_name, gender')
            .eq('id', otherUserId)
            .maybeSingle();

          const idSum = otherUserId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          const colorIndex = idSum % AVATAR_COLORS.length;

          mutualMatches.push({
            ...match,
            match_type: 'swipe_match',
            unread_count: 0,
            last_message: 'Start your conversation...',
            other_user: {
              id: otherUserId,
              display_name: otherUser?.display_name || 'Anonymous',
              avatar_color: AVATAR_COLORS[colorIndex],
              avatar_icon: 'user'
            }
          });
        }
      }

      return mutualMatches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  async sendMessage(matchId: string, content: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(matchId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async getLikesReceived(): Promise<MatchCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // People who liked me (one-way likes)
      const { data: likesToMe } = await supabase
        .from('matches')
        .select('user_a_id')
        .eq('user_b_id', user.id);

      const likerIds = Array.from(new Set((likesToMe || []).map(r => r.user_a_id).filter(Boolean)));

      if (likerIds.length === 0) return [];

      // Remove mutual likes (already matched)
      const { data: myLikesBack } = await supabase
        .from('matches')
        .select('user_b_id')
        .eq('user_a_id', user.id)
        .in('user_b_id', likerIds as string[]);

      const mutualIds = new Set((myLikesBack || []).map(r => r.user_b_id));
      const pendingIds = likerIds.filter(id => !mutualIds.has(id as string));

      if (pendingIds.length === 0) return [];

      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name, gender, verification_status')
        .in('id', pendingIds as string[])
        .eq('verification_status', 'verified');

      return (usersData || []).map(u => ({
        id: u.id,
        display_name: u.display_name || 'Anonymous',
        gender: u.gender || undefined,
        bio: `Interested in connecting.`,
        interests: ['Chat', 'New friends'],
        grad_year: 2024
      }));
    } catch (e) {
      console.error('Error getLikesReceived:', e);
      return [];
    }
  },

  async getLikesSent(): Promise<MatchCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // People I liked (one-way likes)
      const { data: myLikes } = await supabase
        .from('matches')
        .select('user_b_id')
        .eq('user_a_id', user.id);

      const likedIds = Array.from(new Set((myLikes || []).map(r => r.user_b_id).filter(Boolean)));

      if (likedIds.length === 0) return [];

      // Remove mutual likes (already matched)
      const { data: likesBack } = await supabase
        .from('matches')
        .select('user_a_id')
        .eq('user_b_id', user.id)
        .in('user_a_id', likedIds as string[]);

      const mutualIds = new Set((likesBack || []).map(r => r.user_a_id));
      const pendingIds = likedIds.filter(id => !mutualIds.has(id as string));

      if (pendingIds.length === 0) return [];

      const { data: usersData } = await supabase
        .from('users')
        .select('id, display_name, gender, verification_status')
        .in('id', pendingIds as string[])
        .eq('verification_status', 'verified');

      return (usersData || []).map(u => ({
        id: u.id,
        display_name: u.display_name || 'Anonymous',
        gender: u.gender || undefined,
        bio: `Awaiting a match.`,
        interests: ['Chat', 'Connections'],
        grad_year: 2024
      }));
    } catch (e) {
      console.error('Error getLikesSent:', e);
      return [];
    }
  }
};