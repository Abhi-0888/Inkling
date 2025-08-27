import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Users, Sparkles, Eye, MessageCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage = ({ onGetStarted, onSignIn }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Inkling
          </span>
        </div>
        <Button variant="outline" onClick={onSignIn}>
          Sign In
        </Button>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-12 text-center">
        <Badge variant="secondary" className="mb-6">
          <Sparkles className="h-3 w-3 mr-1" />
          100% Anonymous • College Only
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Your Campus,
          <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Completely Anonymous
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Share thoughts, confessions, and connect with your college community without revealing your identity. 
          Find genuine connections through secret likes and anonymous conversations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8"
          >
            Get Started
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Learn More
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">100% Anonymous</h3>
              <p className="text-sm text-muted-foreground">
                No profiles, no usernames. Just genuine thoughts and connections.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">College Gated</h3>
              <p className="text-sm text-muted-foreground">
                Verified students only. Connect with your actual campus community.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secret Connections</h3>
              <p className="text-sm text-muted-foreground">
                Like posts secretly. Match only when feelings are mutual.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-4 py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Inkling Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Verify Your College</h3>
              <p className="text-sm text-muted-foreground">
                Use your .edu email or student ID to join your campus community
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Share Anonymously</h3>
              <p className="text-sm text-muted-foreground">
                Post thoughts, confessions, or questions without revealing your identity
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Connect Privately</h3>
              <p className="text-sm text-muted-foreground">
                Send secret likes, match with mutual interest, and chat privately
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Privacy First</h2>
          <p className="text-muted-foreground mb-6">
            We believe in genuine connections without the pressure of public profiles. 
            Your identity is completely protected, and you control every interaction.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">No Public Profiles</h4>
              <p className="text-muted-foreground">Every post and comment is completely anonymous</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Verified Students Only</h4>
              <p className="text-muted-foreground">College email or ID verification required</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Secret Matching</h4>
              <p className="text-muted-foreground">Private chats only open with mutual interest</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">Safe Environment</h4>
              <p className="text-muted-foreground">Community guidelines and moderation</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-12 text-center bg-gradient-to-r from-primary/5 to-accent/5">
        <h2 className="text-3xl font-bold mb-4">Ready to Join Your Campus?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Start connecting with your college community in a completely new way
        </p>
        <Button 
          onClick={onGetStarted}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8"
        >
          Join Inkling
        </Button>
      </div>
    </div>
  );
};