import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    email?: string;
  };
  skills?: string[];
}

const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: "Axoshard",
    role: "Founder & Lead Developer",
    bio: "Passionate about creating amazing e-commerce experiences. Full-stack developer with a love for React, TypeScript, and beautiful UI design.",
    skills: ["React", "TypeScript", "Node.js", "Full Stack", "UI/UX", "Content Creator"],
  },
  {
    id: 2,
    name: "Spire6969_",
    role: "Co-Owner",
    bio: "Co-founder working alongside Axoshard to build and grow the Axo Shard vision.",
    skills: ["Leadership", "Community Support", "Strategy", "Problem Solving"],
  },
  {
    id: 3,
    name: "lunarqwx",
    role: "Admin",
    bio: "Administrator ensuring smooth operations and supporting the growth of Axo Shard.",
    skills: ["Administration", "Community Building", "Leadership", "Problem Solving"],
  },
  {
    id: 4,
    name: "yui.matri",
    role: "Manager",
    bio: "Manager overseeing community initiatives and ensuring excellent member experiences.",
    skills: ["Management", "Community Support", "Coordination", "Leadership"],
  },
  {
    id: 5,
    name: "sylvrchrome",
    role: "Manager",
    bio: "Manager dedicated to supporting and growing the Axo Shard community.",
    skills: ["Management", "Community Engagement", "Coordination", "Leadership"],
  },
  {
    id: 6,
    name: "Ethereal",
    role: "Community Team",
    bio: "Bringing creativity and joy to our community.",
    skills: ["Community Support", "Content Creator"],
  },
  {
    id: 7,
    name: "idkrocks",
    role: "Featured Artist & Community",
    bio: "Talented artist and valued community member contributing art and support.",
    skills: ["Art", "Community Support"],
  },
  {
    id: 8,
    name: "knifesoundeffect",
    role: "Community Team",
    bio: "Active contributor to the Axo Shard community.",
    skills: ["Community Engagement"],
  },
  {
    id: 9,
    name: "jellyfish.arlo",
    role: "Community Artist",
    bio: "Talented artist contributing beautiful artwork and supporting the Axo Shard community.",
    skills: ["Art", "Design", "Community Support"],
  },
  {
    id: 10,
    name: "KAGE",
    role: "Community Team",
    bio: "Dedicated to making Axo Shard a great place for everyone.",
    skills: ["Community Support"],
  },
  {
    id: 11,
    name: "Python",
    role: "Coder",
    bio: "Developer contributing to the technical growth and development of Axo Shard.",
    skills: ["Coding", "Development", "Problem Solving", "Technical Support"],
  },
  {
    id: 12,
    name: "virankeneth",
    role: "Community Team",
    bio: "Active member supporting the Axo Shard community.",
    skills: ["Community Support"],
  },
  {
    id: 13,
    name: "exoticbutters",
    role: "Community Team",
    bio: "Bringing enthusiasm and support to the community.",
    skills: ["Community Engagement"],
  },
];

export default function Staff() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header cartItemCount={0} onCartClick={() => {}} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The passionate people behind Axo Shard, dedicated to bringing you the best merch and experiences.
          </p>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {staffMembers.map((member) => (
            <Card 
              key={member.id}
              className="overflow-hidden group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {member.name}
                    </CardTitle>
                    <CardDescription className="text-primary/80 font-semibold mt-1">
                      {member.role}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Bio */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.bio}
                </p>

                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <Badge 
                          key={skill}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values Section */}
        <div className="mt-16 pt-12 border-t border-primary/10">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Quality First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We're committed to delivering high-quality merch that our community deserves.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our community's feedback and passion fuel everything we do.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="text-lg">Innovation & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Constantly evolving and improving to bring you the best experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
