"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Key, Camera, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Initialize profile data once session is loaded
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <div className="w-full max-w-md p-4">
            <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Once user data is available
  if (status === "authenticated" && !profileData.name) {
    setProfileData({
      name: session.user.name || "",
      email: session.user.email || "",
    });
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save the profile data to your database
    // For now, we'll just toggle the editing state
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center pb-0">
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative mb-6">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "Profile"}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-white dark:border-gray-700 shadow-md"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold">
                      {session.user?.name ? session.user.name[0].toUpperCase() : <User size={48} />}
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
                  >
                    <Camera size={16} />
                  </Button>
                </div>
                <h2 className="text-xl font-semibold mt-2">{session.user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                <div className="w-full mt-8 space-y-2">
                  <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <User className="mr-3 text-blue-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium">{session.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <Mail className="mr-3 text-blue-500" size={20} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium">{session.user?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-gray-200 dark:border-gray-700 py-4">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User size={16} /> Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={16} /> Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Key size={16} /> Current Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter to confirm changes"
                    />
                    <p className="text-xs text-gray-500">
                      Enter your current password to save changes
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4">Security</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last changed: 2 months ago
                        </p>
                      </div>
                      <Button variant="outline">Change</Button>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Not enabled
                        </p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 py-4">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="destructive" 
                    className="ml-auto flex items-center gap-2"
                  >
                    <LogOut size={16} /> Sign Out
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 