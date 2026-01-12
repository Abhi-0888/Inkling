import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Plus, Check, Star } from 'lucide-react';
import { getEvents, createEvent, rsvpToEvent, Event } from '@/services/eventsService';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'social', label: '🎉 Social' },
  { value: 'study', label: '📚 Study Group' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'food', label: '🍕 Food & Drinks' },
  { value: 'music', label: '🎵 Music' },
  { value: 'art', label: '🎨 Art & Culture' },
];

export const CampusEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    category: 'social',
    max_attendees: 50
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const data = await getEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      toast.error('Please fill in required fields');
      return;
    }

    const event = await createEvent(newEvent);
    if (event) {
      toast.success('Event created!');
      setCreateOpen(false);
      setNewEvent({
        title: '',
        description: '',
        location: '',
        event_date: '',
        category: 'social',
        max_attendees: 50
      });
      loadEvents();
    } else {
      toast.error('Failed to create event');
    }
  };

  const handleRsvp = async (eventId: string, currentStatus?: string) => {
    const newStatus = currentStatus === 'going' ? 'not_going' : 'going';
    const success = await rsvpToEvent(eventId, newStatus as 'going' | 'not_going');
    
    if (success) {
      toast.success(newStatus === 'going' ? 'You\'re going!' : 'RSVP cancelled');
      loadEvents();
    }
  };

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label.split(' ')[0] || '📅';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Campus Events
        </h2>
        
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Event title *"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <Input
                type="datetime-local"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
              />
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Max attendees"
                value={newEvent.max_attendees}
                onChange={(e) => setNewEvent({ ...newEvent, max_attendees: parseInt(e.target.value) || 50 })}
              />
              <Button onClick={handleCreateEvent} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming events</p>
            <p className="text-sm">Be the first to create one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCategoryEmoji(event.category)}</span>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                    </div>
                    
                    {event.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.event_date), 'MMM d, h:mm a')}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.rsvp_count || 0}/{event.max_attendees}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant={event.user_rsvp === 'going' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleRsvp(event.id, event.user_rsvp || undefined)}
                    className="ml-4"
                  >
                    {event.user_rsvp === 'going' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Going
                      </>
                    ) : (
                      'RSVP'
                    )}
                  </Button>
                </div>
                
                {event.creator?.display_name && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Hosted by {event.creator.display_name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
