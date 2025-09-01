"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Check, 
  X, 
  Trash2, 
  Eye,
  Flag,
  MessageSquare,
  Download,
  AlertTriangle,
  Edit,
  Save
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu";
import { ConfirmModal } from "@/components/shadcn/confirm-modal";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { adminAPI, Comment, UpdateCommentData } from "@/api/admin";

interface EditCommentForm {
  content: string;
  status: "pending" | "approved" | "rejected" | "flagged";
}

export function CommentManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editForm, setEditForm] = useState<EditCommentForm>({
    content: "",
    status: "pending"
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const { openConfirmModal, closeConfirmModal, isOpen, title, message, onConfirm } = useConfirmModal();

  useEffect(() => {
    fetchComments();
  }, [currentPage]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getComments(currentPage, commentsPerPage);
      if (response.success) {
        setComments(response.data);
        setFilteredComments(response.data);
        setTotalComments(response.pagination.total);
        setTotalPages(response.pagination.last_page);
      } else {
        setError("Failed to fetch comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = comments;

         // Search filter
     if (searchQuery) {
       filtered = filtered.filter(comment =>
         comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
         comment.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         comment.commentable?.title?.toLowerCase().includes(searchQuery.toLowerCase())
       );
     }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(comment => comment.status === statusFilter);
    }

         // Type filter
     if (typeFilter !== "all") {
       filtered = filtered.filter(comment => comment.commentable?.type === typeFilter);
     }

    setFilteredComments(filtered);
  }, [comments, searchQuery, statusFilter, typeFilter]);

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setEditForm({
      content: comment.content,
      status: comment.status
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingComment) return;

    try {
      setSavingEdit(true);
      const updateData: UpdateCommentData = {
        content: editForm.content,
        status: editForm.status
      };

      const response = await adminAPI.updateComment(editingComment.id, updateData);
      
      if (response.success) {
        // Update the comment in the list
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === editingComment.id 
              ? { ...comment, ...editForm }
              : comment
          )
        );
        
        // Close modal and reset state
        setIsEditModalOpen(false);
        setEditingComment(null);
        setEditForm({
          content: "",
          status: "pending"
        });
      } else {
        setError(response.message || "Failed to update comment");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingComment(null);
    setEditForm({
      content: "",
      status: "pending"
    });
  };

  const handleModerateComment = (commentId: number, action: "approve" | "reject" | "delete") => {
    const comment = comments.find(c => c.id === commentId);
    const actionText = action === "approve" ? "approve" : action === "reject" ? "reject" : "delete";
    
    if (action === "delete") {
      openConfirmModal({
        title: "Delete Comment",
        message: `Are you sure you want to delete this comment? This action cannot be undone and will permanently remove the comment.`,
        onConfirm: async () => {
          try {
            const response = await adminAPI.deleteComment(commentId);
            if (response.success) {
              setComments(prev => prev.filter(c => c.id !== commentId));
              closeConfirmModal();
            } else {
              setError(response.message || "Failed to delete comment");
              closeConfirmModal();
            }
          } catch (err) {
            console.error("Error deleting comment:", err);
            setError("Failed to delete comment");
            closeConfirmModal();
          }
        }
      });
    } else {
      openConfirmModal({
        title: `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        message: `Are you sure you want to ${actionText} this comment?`,
        onConfirm: async () => {
          try {
            const updateData: UpdateCommentData = {
              status: action === "approve" ? "approved" : "rejected"
            };
            const response = await adminAPI.updateComment(commentId, updateData);
            if (response.success) {
              setComments(prev => prev.map(comment => {
                if (comment.id === commentId) {
                  return { ...comment, status: action === "approve" ? "approved" : "rejected" };
                }
                return comment;
              }));
              closeConfirmModal();
            } else {
              setError(response.message || `Failed to ${actionText} comment`);
              closeConfirmModal();
            }
          } catch (err) {
            console.error(`Error ${actionText}ing comment:`, err);
            setError(`Failed to ${actionText} comment`);
            closeConfirmModal();
          }
        }
      });
    }
  };

  const handleBulkAction = (action: "approve" | "reject" | "delete") => {
    if (selectedComments.length === 0) return;

    const actionText = action === "approve" ? "approve" : action === "reject" ? "reject" : "delete";
    
    openConfirmModal({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      message: `Are you sure you want to ${actionText} ${selectedComments.length} selected comment(s)?`,
      onConfirm: async () => {
        try {
          if (action === "delete") {
            // Delete all selected comments
            const deletePromises = selectedComments.map(commentId => 
              adminAPI.deleteComment(commentId)
            );
            
            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter(result => !result.success);
            
            if (failedDeletes.length > 0) {
              setError(`Failed to delete ${failedDeletes.length} comment(s)`);
            } else {
              // Remove deleted comments from the list
              setComments(prev => prev.filter(comment => !selectedComments.includes(comment.id)));
              setSelectedComments([]);
            }
          } else {
            // Approve or reject all selected comments
            const updatePromises = selectedComments.map(commentId => {
              const updateData: UpdateCommentData = {
                status: action === "approve" ? "approved" : "rejected"
              };
              return adminAPI.updateComment(commentId, updateData);
            });
            
            const results = await Promise.all(updatePromises);
            const failedUpdates = results.filter(result => !result.success);
            
            if (failedUpdates.length > 0) {
              setError(`Failed to ${actionText} ${failedUpdates.length} comment(s)`);
            } else {
              // Update comments in the list
              setComments(prev => prev.map(comment => {
                if (selectedComments.includes(comment.id)) {
                  return { ...comment, status: action === "approve" ? "approved" : "rejected" };
                }
                return comment;
              }));
              setSelectedComments([]);
            }
          }
          
          closeConfirmModal();
        } catch (err) {
          console.error(`Error performing bulk ${actionText}:`, err);
          setError(`Failed to ${actionText} comments`);
          closeConfirmModal();
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(comment => comment.id));
    }
  };

  const handleSelectComment = (commentId: number) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      flagged: "destructive"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return "No content";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comment Management</h1>
          <p className="text-gray-600">Moderate and manage user comments across the site</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            View All Comments
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold">{totalComments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedComments.length} comment(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("approve")}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("reject")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({totalComments})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-3 font-medium">Comment</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">On</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900">
                          {truncateContent(comment.content)}
                        </p>
                        {comment.is_spam && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Spam
                          </Badge>
                        )}
                        {comment.reply_count > 0 && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {comment.reply_count} replies
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {(comment.user.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{comment.user.name || "Unknown User"}</div>
                          <div className="text-xs text-gray-500">
                            {comment.user.display_roles?.join(", ") || "User"}
                          </div>
                        </div>
                      </div>
                    </td>
                                         <td className="p-3">
                       <div className="max-w-xs">
                         <div className="text-sm font-medium text-gray-900">
                           {comment.commentable?.title || "Unknown"}
                         </div>
                         <div className="text-xs text-gray-500">
                           {comment.commentable?.type || "Unknown"} • {comment.commentable?.series?.title || "Unknown Series"}
                         </div>
                       </div>
                     </td>
                    <td className="p-3">
                      {getStatusBadge(comment.status || "pending")}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                          <DropdownMenuItem onClick={() => handleEditComment(comment)} className="hover:bg-gray-50">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleModerateComment(comment.id, "approve")}
                            className="hover:bg-gray-50"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleModerateComment(comment.id, "reject")}
                            className="hover:bg-gray-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleModerateComment(comment.id, "delete")}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages} ({totalComments} total comments)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Comment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCancelEdit}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Comment
                </h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Comment Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Comment Content</h4>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter comment content..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Comment Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  {(["pending", "approved", "rejected", "flagged"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditForm(prev => ({ ...prev, status }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        editForm.status === status
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium capitalize">{status}</div>
                      <div className="text-sm text-gray-500">
                        {status === "pending" && "Awaiting moderation"}
                        {status === "approved" && "Comment is visible to users"}
                        {status === "rejected" && "Comment is hidden from users"}
                        {status === "flagged" && "Comment has been flagged for review"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Info */}
              {editingComment && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Comment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                         <div>
                       <p><span className="font-semibold">Author:</span> {editingComment.user.name}</p>
                       <p><span className="font-semibold">Posted on:</span> {formatDate(editingComment.created_at)}</p>
                     </div>
                     <div>
                       <p><span className="font-semibold">Location:</span> {editingComment.commentable?.title || "Unknown"}</p>
                       <p><span className="font-semibold">Type:</span> {editingComment.commentable?.type || "Unknown"}</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isOpen}
        title={title}
        message={message}
        onConfirm={onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}
