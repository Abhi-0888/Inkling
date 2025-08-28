// Mock data to seed the database with initial content for demo purposes

export const mockInstitutes = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Stanford University',
    domain_patterns: ['stanford.edu', 'alumni.stanford.edu'],
    active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Harvard University',
    domain_patterns: ['harvard.edu', 'college.harvard.edu'],
    active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'MIT',
    domain_patterns: ['mit.edu', 'alum.mit.edu'],
    active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'UC Berkeley',
    domain_patterns: ['berkeley.edu', 'alumni.berkeley.edu'],
    active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'University of Washington',
    domain_patterns: ['uw.edu', 'u.washington.edu'],
    active: true,
  }
];

export const mockPosts = [
  {
    content: "Anyone else feeling like finals week is just a social experiment to see how much coffee a human can consume? 😅",
    kind: 'text' as const,
    visibility: 'campus' as const,
    created_hours_ago: 2
  },
  {
    content: "Hot take: The library at 2 AM has better vibes than any club. Change my mind.",
    kind: 'text' as const,
    visibility: 'campus' as const,
    created_hours_ago: 4
  },
  {
    content: "Spotted: Someone actually using the gym equipment properly. Rare sighting on campus! 🦄",
    kind: 'text' as const,
    visibility: 'global' as const,
    created_hours_ago: 6
  },
  {
    content: "PSA: The dining hall cookies are actually good today. This is not a drill. 🍪",
    kind: 'text' as const,
    visibility: 'campus' as const,
    created_hours_ago: 8
  },
  {
    content: "Why do professors think 8 AM classes are a good idea? Who hurt them?",
    kind: 'text' as const,
    visibility: 'global' as const,
    created_hours_ago: 12
  },
  {
    content: "Successfully avoided my ex in the dining hall by hiding behind the salad bar. College life skills: unlocked. 🫣",
    kind: 'text' as const,
    visibility: 'campus' as const,
    created_hours_ago: 16
  }
];