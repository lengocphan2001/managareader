const express = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const { auth, optionalAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get recent comments
router.get("/recent", async (req, res) => {
  try {
    const { limit = 15 } = req.query;

    const comments = await prisma.comment.findMany({
      take: parseInt(limit),
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_path: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar_path: comment.user.avatar_path,
        display_roles: comment.user.roles.map((ur) => ur.role.name),
      },
      commentable: {
        title: `Series ${comment.commentable_id}`,
        type: comment.commentable_type,
        id: comment.commentable_id,
        uuid: comment.commentable_id,
        series: {
          title: `Series ${comment.commentable_id}`,
          uuid: comment.commentable_id,
        },
      },
      commentable_type: comment.commentable_type,
      parent_id: comment.parent_id,
      reply_count: 0,
    }));

    res.json({
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Get recent comments error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get comment list
router.get("/list", optionalAuth, async (req, res) => {
  try {
    const { type, type_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!type || !type_id) {
      return res.status(400).json({
        success: false,
        message: "Type and type_id are required",
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        commentable_type: type,
        commentable_id: type_id,
        parent_id: null, // Only top-level comments
      },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_path: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar_path: true,
                roles: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const total = await prisma.comment.count({
      where: {
        commentable_type: type,
        commentable_id: type_id,
        parent_id: null,
      },
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar_path: comment.user.avatar_path,
        display_roles: comment.user.roles.map((ur) => ur.role.name),
      },
      parent_id: comment.parent_id,
      reply_count: comment.replies.length,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.created_at,
        user: {
          id: reply.user.id,
          name: reply.user.name,
          avatar_path: reply.user.avatar_path,
          display_roles: reply.user.roles.map((ur) => ur.role.name),
        },
        parent_id: reply.parent_id,
      })),
    }));

    res.json({
      comments: {
        data: formattedComments,
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get comment list error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Store comment
router.post(
  "/store",
  auth,
  [
    body("content").trim().isLength({ min: 1, max: 1000 }),
    body("type").isIn(["series", "chapter"]),
    body("type_id").isString(),
    body("parent_id").optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { content, type, type_id, parent_id } = req.body;

      const comment = await prisma.comment.create({
        data: {
          content,
          user_id: req.user.id,
          commentable_type: type,
          commentable_id: type_id,
          parent_id: parent_id || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_path: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        comment: {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user.id,
            name: comment.user.name,
            avatar_path: comment.user.avatar_path,
            display_roles: comment.user.roles.map((ur) => ur.role.name),
          },
          parent_id: comment.parent_id,
        },
      });
    } catch (error) {
      console.error("Store comment error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Update comment
router.post(
  "/update",
  auth,
  [body("content").trim().isLength({ min: 1, max: 1000 }), body("id").isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { content, id } = req.body;

      // Check if comment exists and belongs to user
      const comment = await prisma.comment.findFirst({
        where: {
          id: parseInt(id),
          user_id: req.user.id,
        },
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found or you do not have permission to edit it",
        });
      }

      // Update comment
      const updatedComment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { content },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_path: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Comment updated successfully",
        comment: {
          id: updatedComment.id,
          content: updatedComment.content,
          created_at: updatedComment.created_at,
          user: {
            id: updatedComment.user.id,
            name: updatedComment.user.name,
            avatar_path: updatedComment.user.avatar_path,
            display_roles: updatedComment.user.roles.map((ur) => ur.role.name),
          },
        },
      });
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Delete comment
router.post("/delete", auth, [body("id").isInt()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.body;

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findFirst({
      where: {
        id: parseInt(id),
        user_id: req.user.id,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you do not have permission to delete it",
      });
    }

    // Delete comment (this will also delete replies due to cascade)
    await prisma.comment.delete({
      where: { id: parseInt(id) },
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

// Get comment replies
router.post(
  "/fetch-reply",
  optionalAuth,
  [body("last_id").isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { last_id } = req.body;

      const replies = await prisma.comment.findMany({
        where: {
          parent_id: parseInt(last_id),
        },
        orderBy: { created_at: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_path: true,
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      const formattedReplies = replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        created_at: reply.created_at,
        user: {
          id: reply.user.id,
          name: reply.user.name,
          avatar_path: reply.user.avatar_path,
          display_roles: reply.user.roles.map((ur) => ur.role.name),
        },
        parent_id: reply.parent_id,
      }));

      res.json({
        replies: formattedReplies,
      });
    } catch (error) {
      console.error("Get comment replies error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

module.exports = router;
