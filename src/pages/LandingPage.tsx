import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Users, Sparkles, Eye, MessageCircle } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const LandingPage = ({ onGetStarted, onSignIn }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 flex justify-between items-center relative z-10"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Inkling
          </span>
        </div>
        <Button variant="outline" onClick={onSignIn} className="hover:scale-105 transition-transform">
          Sign In
        </Button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-12 text-center relative z-10"
      >
        <motion.div variants={itemVariants}>
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm glass border-primary/20">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            100% Anonymous • College Only
          </Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
        >
          Your Campus,
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            Completely Anonymous
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          Share thoughts, confessions, and connect with your college community without revealing your identity.
          Find genuine connections through secret likes and anonymous conversations.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 hover:bg-secondary/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300"
          >
            Learn More
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Eye, title: "100% Anonymous", desc: "No profiles, no usernames. Just genuine thoughts and connections.", color: "text-primary", bg: "bg-primary/10" },
            { icon: Users, title: "College Gated", desc: "Verified students only. Connect with your actual campus community.", color: "text-accent", bg: "bg-accent/10" },
            { icon: MessageCircle, title: "Secret Connections", desc: "Like posts secretly. Match only when feelings are mutual.", color: "text-primary", bg: "bg-primary/10" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full border-0 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-colors duration-300 shadow-xl shadow-black/5">
                <CardContent className="p-8 text-center">
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works Section */}
      <div className="px-4 py-20 bg-muted/30 relative">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            How Inkling Works
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-12 relative"
          >
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />

            {[
              { num: "1", title: "Verify Your College", desc: "Use your .edu email or student ID to join your campus community" },
              { num: "2", title: "Share Anonymously", desc: "Post thoughts, confessions, or questions without revealing your identity" },
              { num: "3", title: "Connect Privately", desc: "Send secret likes, match with mutual interest, and chat privately" }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20 transform rotate-3 hover:-rotate-3 transition-transform duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Privacy First</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in genuine connections without the pressure of public profiles.
              Your identity is completely protected, and you control every interaction.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {[
              { title: "No Public Profiles", desc: "Every post and comment is completely anonymous" },
              { title: "Verified Students Only", desc: "College email or ID verification required" },
              { title: "Secret Matching", desc: "Private chats only open with mutual interest" },
              { title: "Safe Environment", desc: "Community guidelines and moderation active 24/7" }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:bg-card/50 transition-colors"
              >
                <h4 className="font-semibold text-lg mb-2 text-primary">{item.title}</h4>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Join Your Campus?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start connecting with your college community in a completely new way.
            Zero pressure. 100% You.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-10 py-6 h-auto shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            Join Inkling Now
          </Button>
        </motion.div>
      </div>
    </div >
  );
};