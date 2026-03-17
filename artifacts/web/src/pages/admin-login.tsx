import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const setToken = useAuth(s => s.setToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    login.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          setToken(data.token);
          setLocation("/admin");
        },
        onError: () => {
          setError("Invalid credentials. Please try again.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none rounded-3xl overflow-hidden">
        <div className="bg-secondary p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 p-1 shadow-inner">
            <img src={`${import.meta.env.BASE_URL}images/logo-badge.png`} alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <CardTitle className="text-3xl font-heading text-secondary-foreground mb-2">Admin Portal</CardTitle>
          <CardDescription className="text-secondary-foreground/70">Sign in to manage your menu</CardDescription>
        </div>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              disabled={login.isPending}
            >
              {login.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
