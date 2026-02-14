-- Seed data for development and testing

-- Insert sample institutes
INSERT INTO institutes (id, name, domain_patterns, active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Stanford University', ARRAY['stanford.edu', 'alumni.stanford.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Harvard University', ARRAY['harvard.edu', 'college.harvard.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440003', 'MIT', ARRAY['mit.edu', 'alum.mit.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440004', 'UC Berkeley', ARRAY['berkeley.edu', 'alumni.berkeley.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440005', 'University of Washington', ARRAY['uw.edu', 'u.washington.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440006', 'University of California San Diego', ARRAY['ucsd.edu', 'alumni.ucsd.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440007', 'Carnegie Mellon University', ARRAY['cmu.edu', 'alumni.cmu.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440008', 'Georgia Institute of Technology', ARRAY['gatech.edu', 'alumni.gatech.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440009', 'University of Texas at Austin', ARRAY['utexas.edu', 'alumni.utexas.edu'], true),
    ('550e8400-e29b-41d4-a716-446655440010', 'New York University', ARRAY['nyu.edu', 'alumni.nyu.edu'], true);

-- Insert sample feature flags
INSERT INTO feature_flags (key, enabled, audience_json) VALUES
    ('post_images', true, '{"all": true}'),
    ('post_polls', false, '{"beta_users": true}'),
    ('secret_likes', true, '{"all": true}'),
    ('global_feed', true, '{"all": true}'),
    ('chat_media', false, '{"premium_users": true}'),
    ('profile_customization', false, '{"staff": true}');

-- Note: User accounts will be created through the authentication flow
-- Sample posts, reactions, etc. will be created by users during testing