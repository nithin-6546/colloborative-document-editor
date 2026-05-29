import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { 
  FileText, Plus, Search, LogOut, Share2, 
  Calendar, User, Users, Globe, ExternalLink, Loader,
  Trash2, RotateCcw, Lock, X
} from "lucide-react";

export const DashboardPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [trashDocs, setTrashDocs] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "trash"
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creating, setCreating] = useState(false);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  
  // User profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Edit Profile State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Fetch active and trashed documents
  const fetchDocuments = async () => {
    try {
      // Fetch active documents
      const activeRes = await api.get("/api/documents/getalldocs");
      if (activeRes.data && activeRes.data.success) {
        setDocuments(activeRes.data.documents);
      }

      // Fetch trashed documents
      const trashRes = await api.get("/api/documents/gettrashdocs");
      if (trashRes.data && trashRes.data.success) {
        setTrashDocs(trashRes.data.documents);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Pre-populate Edit Profile form fields
  useEffect(() => {
    if (user) {
      setProfileFirstName(user.firstName || "");
      setProfileLastName(user.lastName || "");
    }
  }, [user, isEditProfileModalOpen]);

  // Create new document
  const handleCreateDocument = async () => {
    setCreating(true);
    try {
      const res = await api.post("/api/documents/create");
      if (res.data && res.data.success) {
        navigate(`/documents/${res.data.document._id}`);
      }
    } catch (err) {
      console.error("Error creating document:", err);
      alert("Failed to create document. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Move document to Trash (Soft Delete)
  const handleTrashDocument = async (e, docId) => {
    e.stopPropagation(); // Prevent navigating to the document
    if (!window.confirm("Are you sure you want to move this document to Trash?")) return;
    
    try {
      setLoading(true);
      const res = await api.put(`/api/documents/${docId}/trash`);
      if (res.data && res.data.success) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Error trashing document:", err);
      alert(err.response?.data?.message || "Failed to move document to Trash.");
    } finally {
      setLoading(false);
    }
  };

  // Restore document from Trash
  const handleRestoreDocument = async (e, docId) => {
    e.stopPropagation(); // Prevent navigating
    try {
      setLoading(true);
      const res = await api.put(`/api/documents/${docId}/restore-doc`);
      if (res.data && res.data.success) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Error restoring document:", err);
      alert(err.response?.data?.message || "Failed to restore document.");
    } finally {
      setLoading(false);
    }
  };

  // Open Share Modal
  const openShareModal = (e, doc) => {
    e.stopPropagation(); // Prevent navigating to the document
    setSelectedDoc(doc);
    setShareEmail("");
    setShareRole("viewer");
    setShareError("");
    setShareSuccess("");
    setIsShareModalOpen(true);
  };

  // Handle Share Submission
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareError("");
    setShareSuccess("");

    if (!shareEmail.trim()) {
      setShareError("Please enter a valid email address.");
      return;
    }

    setShareLoading(true);
    try {
      const res = await api.post(`/api/documents/${selectedDoc._id}/share`, {
        email: shareEmail,
        role: shareRole,
      });

      if (res.data && res.data.success) {
        setShareSuccess(`Successfully shared with ${shareEmail} as ${shareRole}!`);
        setShareEmail("");
        // Refresh documents to update collaborators lists
        fetchDocuments();
        setTimeout(() => {
          setIsShareModalOpen(false);
        }, 1500);
      }
    } catch (err) {
      setShareError(err.response?.data?.message || "Failed to share document.");
    } finally {
      setShareLoading(false);
    }
  };

  // Handle Edit Profile Form Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileFirstName.trim()) {
      setProfileError("First name is required.");
      return;
    }

    // Password change validation
    if (newPassword) {
      if (!currentPassword) {
        setProfileError("Current password is required to change password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileError("New passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setProfileError("New password must be at least 6 characters.");
        return;
      }
    }

    try {
      setProfileLoading(true);
      const res = await api.put("/api/users/update-profile", {
        firstName: profileFirstName,
        lastName: profileLastName,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword ? newPassword : undefined,
      });

      if (res.data && res.data.success) {
        updateUser(res.data.user);
        setProfileSuccess("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Refresh documents list to load updated user names inside card listings
        fetchDocuments();

        setTimeout(() => {
          setIsEditProfileModalOpen(false);
          setProfileSuccess("");
        }, 1500);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Select active set based on active tab
  const activeSet = activeTab === "active" ? documents : trashDocs;

  // Filter documents by title and search query
  const filteredDocs = activeSet.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      {/* Navbar */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-100">
            <FileText size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            Docs
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex max-w-xl flex-1 items-center space-x-2 rounded-xl bg-slate-100 px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 border border-transparent transition-all mx-8">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === "trash" ? "Search deleted files..." : "Search your documents..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm border-2 border-transparent hover:border-blue-300 transition-all uppercase"
          >
            {user?.firstName?.charAt(0) || "U"}
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-20">
              <div className="border-b border-slate-100 pb-3 mb-3 text-left">
                <p className="font-semibold text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              {/* Edit Profile Action Row */}
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setProfileError("");
                  setProfileSuccess("");
                  setIsEditProfileModalOpen(true);
                }}
                className="flex w-full items-center space-x-2 rounded-lg py-2 px-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-all mb-1 cursor-pointer"
              >
                <User size={16} className="text-slate-400" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center space-x-2 rounded-lg py-2 px-3 text-left text-sm text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Start New Document Banner */}
      {activeTab === "active" && (
        <section className="bg-slate-100 py-8 px-8 border-b border-slate-200">
          <div className="max-w-5xl mx-auto text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Start a new document
            </h2>
            <div className="flex">
              <button
                onClick={handleCreateDocument}
                disabled={creating}
                className="group flex flex-col items-center justify-center w-36 h-48 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 text-blue-600 transition-all mb-4">
                  {creating ? (
                    <Loader className="animate-spin" size={28} />
                  ) : (
                    <Plus size={32} />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                  Blank Document
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 text-left">
        {/* Navigation Tabs (Recent Documents vs Trash) */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => {
              setActiveTab("active");
              setSearchQuery("");
            }}
            className={`mr-6 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "active"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Recent Documents ({documents.length})
          </button>
          
          <button
            onClick={() => {
              setActiveTab("trash");
              setSearchQuery("");
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "trash"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Trash2 size={16} />
            <span>Trash ({trashDocs.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={36} />
            <p className="mt-4 text-sm text-slate-500">Loading your files...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl bg-white border border-slate-200 border-dashed">
            {activeTab === "trash" ? (
              <>
                <Trash2 size={48} className="text-slate-300 mb-4" />
                <p className="text-base font-semibold text-slate-600">Trash is empty</p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchQuery ? "Try a different search query." : "Soft-deleted documents will appear here."}
                </p>
              </>
            ) : (
              <>
                <FileText size={48} className="text-slate-300 mb-4" />
                <p className="text-base font-semibold text-slate-600">No documents found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchQuery ? "Try a different search query." : "Click Blank Document to create your first page!"}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const isOwner = doc.owner?._id === user?._id || doc.owner === user?._id;
              
              return (
                <div
                  key={doc._id}
                  onClick={() => {
                    if (activeTab === "trash") {
                      alert("Please restore this document first to open and edit it.");
                    } else {
                      navigate(`/documents/${doc._id}`);
                    }
                  }}
                  className="group flex flex-col justify-between h-44 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer relative"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                      </div>
                      <div className="flex items-center space-x-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 uppercase">
                        {isOwner ? (
                          <>
                            <User size={12} />
                            <span>Owner</span>
                          </>
                        ) : (
                          <>
                            <Users size={12} />
                            <span>Shared</span>
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="mt-4 font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                    <div className="flex items-center text-xs text-slate-400 space-x-1">
                      <Calendar size={12} />
                      <span>{formatDate(doc.updatedAt)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {activeTab === "active" ? (
                        <>
                          {isOwner && (
                            <>
                              <button
                                onClick={(e) => openShareModal(e, doc)}
                                title="Share Document"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                              >
                                <Share2 size={14} />
                              </button>

                              <button
                                onClick={(e) => handleTrashDocument(e, doc._id)}
                                title="Move to Trash"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          <div
                            title="Open in Editor"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
                          >
                            <ExternalLink size={14} />
                          </div>
                        </>
                      ) : (
                        <>
                          {isOwner && (
                            <button
                              onClick={(e) => handleRestoreDocument(e, doc._id)}
                              title="Restore Document"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 scale-in text-left">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Share "{selectedDoc?.title}"
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Add collaborators by email to view or edit this document.
            </p>

            {shareError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                {shareError}
              </div>
            )}

            {shareSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-600 border border-green-100">
                {shareSuccess}
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Collaborator Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Collaborator Role
                </label>
                <select
                  value={shareRole}
                  onChange={(e) => setShareRole(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="editor">Editor (Can edit)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {shareLoading ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <span>Share</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal Dialog */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-medium font-sans">
              Update your personal details or change your account password.
            </p>

            {profileError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs font-semibold text-green-600 border border-green-100">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans">
              {/* Registered Email (Locked) */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                  <span>Registered Email</span>
                  <Lock size={12} className="text-slate-400" />
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed font-semibold outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 select-none uppercase">
                    Locked
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={profileFirstName}
                    onChange={(e) => setProfileFirstName(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={profileLastName}
                    onChange={(e) => setProfileLastName(e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                  Change Password (Optional)
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded-lg shadow disabled:opacity-50 transition-all cursor-pointer"
                >
                  {profileLoading ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
