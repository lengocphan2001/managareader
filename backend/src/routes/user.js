const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const { auth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get user info (for /api/user endpoint)
router.get("/", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_path: user.avatar_path,
        created_at: user.created_at,
        email_verified_at: user.email_verified_at,
        comment_count: user._count.comments,
        display_roles: user.roles.map((ur) => ur.role.name),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get read list
router.get("/read-list", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const readList = await prisma.readList.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: "desc" },
      skip: offset,
      take: parseInt(limit),
    });

    const total = await prisma.readList.count({
      where: { user_id: req.user.id },
    });

    res.json({
      success: true,
      data: readList,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get read list error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get followed manga list
router.get("/follows", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const follows = await prisma.follow.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      skip: offset,
      take: parseInt(limit),
    });

    const total = await prisma.follow.count({
      where: { user_id: req.user.id },
    });

    // Get the latest chapter for each followed manga
    const followsWithLatestChapter = await Promise.all(
      follows.map(async (follow) => {
        // For now, we'll return basic info. In a real implementation,
        // you'd want to fetch the latest chapter from MangaDex API
        return {
          series_uuid: follow.series_id,
          latest_chapter_uuid: null, // This would come from MangaDex API
          title: null, // This would come from MangaDex API
          chapter_updated_at: follow.created_at,
          chapter_title: null, // This would come from MangaDex API
        };
      }),
    );

    res.json({
      success: true,
      data: followsWithLatestChapter,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total,
        last_page: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get follows error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Sync read list
router.post(
  "/read-list/sync",
  auth,
  [
    body("source").isIn(["mangadex", "cmanga", "cuutruyen"]),
    body("ids").isArray(),
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

      const { source: _source, ids } = req.body;

      // Delete existing read list for this user
      await prisma.readList.deleteMany({
        where: { user_id: req.user.id },
      });

      // Add new read list items
      const readListItems = ids.map((seriesId) => ({
        user_id: req.user.id,
        series_id: seriesId,
      }));

      await prisma.readList.createMany({
        data: readListItems,
      });

      res.json({
        success: true,
        message: "Read list synced successfully",
      });
    } catch (error) {
      console.error("Sync read list error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Change password
router.post(
  "/change-password",
  auth,
  [
    body("current_password").exists(),
    body("password").isLength({ min: 6 }),
    body("password_confirmation").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
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

      const { current_password, password } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      // Check current password
      const isCurrentPasswordValid = await bcrypt.compare(
        current_password,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Change name
router.post(
  "/change-name",
  auth,
  [body("name").trim().isLength({ min: 2 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name } = req.body;

      await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
      });

      res.json({
        success: true,
        message: "Name changed successfully",
      });
    } catch (error) {
      console.error("Change name error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Change avatar
router.post("/change-avatar", auth, async (req, res) => {
  try {
    // For now, just return success
    // In production, you would handle file upload here
    res.json({
      success: true,
      message: "Avatar upload not implemented yet",
    });
  } catch (error) {
    console.error("Change avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
