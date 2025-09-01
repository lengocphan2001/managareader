const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { auth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user has admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const hasAdminRole = user.roles.some(ur => 
      ur.role.name === "admin" || ur.role.name === "mod"
    );

    if (!hasAdminRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get admin dashboard stats
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalComments,
      recentUsers,
      recentComments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.comment.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          avatar_path: true,
        },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalComments,
        totalSeries: 0, // No series table in your schema
        pendingComments: 0, // No status field in your schema
        recentUsers,
        recentComments: recentComments.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: comment.user,
          series: null, // No series relation in your schema
        })),
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all users with pagination
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_path: user.avatar_path,
        created_at: user.created_at,
        email_verified_at: user.email_verified_at,
        comment_count: user._count.comments,
        display_roles: user.roles.map(ur => ur.role.name),
      })),
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update user roles
router.put("/users/:userId/roles", auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    // First, remove all existing roles
    await prisma.userRole.deleteMany({
      where: { user_id: parseInt(userId) },
    });

    // Then add new roles
    if (roles && roles.length > 0) {
      const roleData = roles.map(roleName => ({
        user_id: parseInt(userId),
        role: {
          connect: { name: roleName },
        },
      }));

      await prisma.userRole.createMany({
        data: roleData,
      });
    }

    res.json({
      success: true,
      message: "User roles updated successfully",
    });
  } catch (error) {
    console.error("Update user roles error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete user
router.delete("/users/:userId", auth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has admin role (prevent deleting admins)
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (user.roles.some(ur => ur.role.name === "admin")) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get all comments with pagination
router.get("/comments", auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip: offset,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.comment.count(),
    ]);

    res.json({
      success: true,
      data: comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        status: "approved", // Default status since no status field exists
        created_at: comment.created_at,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          email: comment.user.email,
          display_roles: ["User"], // Default role
          avatar_path: null,
        },
        parent_id: comment.parent_id,
        reply_count: 0, // You can calculate this if needed
        commentable: {
          title: `${comment.commentable_type} ${comment.commentable_id}`,
          type: comment.commentable_type,
          id: comment.commentable_id,
          uuid: comment.commentable_id,
          series: {
            title: `${comment.commentable_type} ${comment.commentable_id}`,
            uuid: comment.commentable_id,
          },
        },
        is_spam: false, // Default value
      })),
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admin comments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete comment
router.delete("/comments/:commentId", auth, requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
