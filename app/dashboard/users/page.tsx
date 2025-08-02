"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Users, User, Calendar, Mail, Shield } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const response = await axios.get(`/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to fetch users";
      setError(errorMessage);
      toast.error(errorMessage);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterUsers(term, roleFilter);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    filterUsers(searchTerm, role);
  };

  const filterUsers = (searchTerm: string, roleFilter: string) => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter && roleFilter !== "") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "customer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "customer":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Users Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Total: {filteredUsers.length} users</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Role Filter */}
              <div className="sm:w-48">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  id="role"
                  value={roleFilter}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading users...</h3>
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mt-4"></div>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Users Grid */
            <>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {roleFilter ? `No ${roleFilter} users found` : "No users in the system yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        {/* User Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {user.name || "No Name"}
                              </h3>
                              <p className="text-sm text-gray-500">
                                ID: {user.id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              <span className="ml-1">
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Email:</span>
                            <span className="text-sm text-gray-600">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
