import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  max_attendees: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  creator?: {
    display_name: string | null;
  };
  rsvp_count?: number;
  user_rsvp?: string | null;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  // Get RSVP counts and creator info
  const eventsWithDetails = await Promise.all((data || []).map(async (event) => {
    const { count } = await supabase
      .from('event_rsvps')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id)
      .eq('status', 'going');

    const { data: creatorData } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', event.creator_id)
      .single();

    return { 
      ...event, 
      rsvp_count: count || 0,
      creator: creatorData || undefined
    };
  }));

  return eventsWithDetails;
};

export const createEvent = async (event: {
  title: string;
  description?: string;
  location?: string;
  event_date: string;
  category: string;
  max_attendees?: number;
}): Promise<Event | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...event,
      creator_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }

  return data;
};

export const rsvpToEvent = async (eventId: string, status: 'going' | 'interested' | 'not_going'): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  if (status === 'not_going') {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    return !error;
  }

  const { error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_id: eventId,
      user_id: user.id,
      status
    });

  return !error;
};

export const getUserRsvp = async (eventId: string): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('event_rsvps')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  return data?.status || null;
};
