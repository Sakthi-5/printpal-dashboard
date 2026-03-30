import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrintQueue } from "@/context/PrintQueueContext";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, User } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginUser } = usePrintQueue();
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [userName, setUserName] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(adminUser, adminPass)) {
      toast.success("Welcome, Admin!");
      navigate("/admin");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    loginUser(userName.trim());
    toast.success(`Welcome, ${userName.trim()}!`);
    navigate("/user");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <img src={logo} alt="PrintQueue Pro" width={120} height={120} className="mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-3xl font-bold font-heading text-primary-foreground">
            Welcome to PrintQueue Pro
          </h1>
          <p className="text-primary-foreground/80 mt-2">Your smart print management system</p>
        </div>

        <Card className="shadow-vibrant border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-center font-heading text-foreground">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="user" className="flex items-center gap-2"><User className="h-4 w-4" />User</TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2"><Shield className="h-4 w-4" />Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Your Name</Label>
                    <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                    Continue as User
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="adminUser">Admin ID</Label>
                    <Input id="adminUser" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Enter admin ID" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="adminPass">Password</Label>
                    <Input id="adminPass" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Enter password" className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
