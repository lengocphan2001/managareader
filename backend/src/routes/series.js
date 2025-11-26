const express = require("express");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const { auth, optionalAuth } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get homepage series (mock data for now)
router.get("/homepage", async (req, res) => {
  try {
    const { limit = 28, page = 1 } = req.query;
    const _offset = (page - 1) * limit;

    // For now, return empty data
    // In production, you might want to cache popular series from MangaDex
    res.json({
      data: [],
      total: 0,
      current_page: parseInt(page),
      per_page: parseInt(limit),
      last_page: 1,
    });
  } catch (error) {
    console.error("Get homepage series error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Follow/Unfollow series
router.post(
  "/follow",
  auth,
  [body("series_uuid").isString()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { series_uuid } = req.body;

      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          user_id_series_id: {
            user_id: req.user.id,
            series_id: series_uuid,
          },
        },
      });

      if (existingFollow) {
        // Unfollow
        await prisma.follow.delete({
          where: {
            user_id_series_id: {
              user_id: req.user.id,
              series_id: series_uuid,
            },
          },
        });

        res.json({
          success: true,
          message: "Unfollowed successfully",
          followed: false,
        });
      } else {
        // Follow
        await prisma.follow.create({
          data: {
            user_id: req.user.id,
            series_id: series_uuid,
          },
        });

        res.json({
          success: true,
          message: "Followed successfully",
          followed: true,
        });
      }
    } catch (error) {
      console.error("Follow/Unfollow series error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Check series info (follow status, comment count)
router.post(
  "/check-info",
  optionalAuth,
  [body("series_uuid").isString()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { series_uuid } = req.body;

      let followed = null;
      if (req.user) {
        const follow = await prisma.follow.findUnique({
          where: {
            user_id_series_id: {
              user_id: req.user.id,
              series_id: series_uuid,
            },
          },
        });
        followed = !!follow;
      }

      // Get comment count for this series
      const commentCount = await prisma.comment.count({
        where: {
          commentable_type: "series",
          commentable_id: series_uuid,
        },
      });

      res.json({
        followed,
        comment_count: commentCount,
      });
    } catch (error) {
      console.error("Check series info error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Note: Reading status is managed directly via Mangadex API from frontend
// These endpoints are kept for potential future use or proxy functionality
// The frontend calls Mangadex API directly using user's Mangadex token stored in localStorage

module.exports = router;
