import { supabase } from "@/integrations/supabase/client";

export interface CampusPoll {
  id: string;
  creator_id: string;
  question: string;
  options: string[];
  category: string;
  ends_at: string;
  is_featured: boolean;
  created_at: string;
  votes?: number[];
  total_votes?: number;
  user_vote?: number | null;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export const getActivePolls = async (): Promise<CampusPoll[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('campus_polls')
    .select('*')
    .gte('ends_at', new Date().toISOString())
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching polls:', error);
    return [];
  }

  // Get votes for each poll
  const pollsWithVotes = await Promise.all((data || []).map(async (poll) => {
    const options = Array.isArray(poll.options) ? poll.options : JSON.parse(poll.options as string);
    
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('option_index')
      .eq('poll_id', poll.id);

    const voteCounts = new Array(options.length).fill(0);
    (votes || []).forEach(v => {
      if (v.option_index >= 0 && v.option_index < voteCounts.length) {
        voteCounts[v.option_index]++;
      }
    });

    let userVote = null;
    if (user) {
      const { data: userVoteData } = await supabase
        .from('poll_votes')
        .select('option_index')
        .eq('poll_id', poll.id)
        .eq('user_id', user.id)
        .maybeSingle();
      userVote = userVoteData?.option_index ?? null;
    }

    return {
      ...poll,
      options,
      votes: voteCounts,
      total_votes: voteCounts.reduce((a, b) => a + b, 0),
      user_vote: userVote
    };
  }));

  return pollsWithVotes;
};

export const votePoll = async (pollId: string, optionIndex: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('poll_votes')
    .upsert({
      poll_id: pollId,
      user_id: user.id,
      option_index: optionIndex
    });

  return !error;
};

export const createPoll = async (poll: {
  question: string;
  options: string[];
  category: string;
  ends_at: string;
}): Promise<CampusPoll | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('campus_polls')
    .insert({
      ...poll,
      creator_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating poll:', error);
    return null;
  }

  return {
    ...data,
    options: Array.isArray(data.options) ? data.options : JSON.parse(data.options as string)
  } as CampusPoll;
};

export const getFeaturedPoll = async (): Promise<CampusPoll | null> => {
  const polls = await getActivePolls();
  return polls.find(p => p.is_featured) || polls[0] || null;
};
