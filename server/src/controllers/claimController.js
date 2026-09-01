const pool = require("../config/db");

const createClaim = async (req, res) => {
    try {
        const { itemId, message } = req.body;
        const claimantId = req.user.userId;

        const itemResult = await pool.query(
            `
            SELECT id, user_id, status
            FROM items
            WHERE id = $1
            `,
            [itemId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        const item = itemResult.rows[0];

        if (item.user_id === claimantId) {
            return res.status(400).json({
                success: false,
                message: "You cannot claim your own item",
            });
        }

        if (item.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "This item is no longer accepting claims",
            });
        }

        const existingClaim = await pool.query(
            `
            SELECT id
            FROM claims
            WHERE item_id = $1
              AND claimant_id = $2
            `,
            [itemId, claimantId]
        );

        if (existingClaim.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a claim for this item",
            });
        }

        const result = await pool.query(
            `
            INSERT INTO claims
            (
                item_id,
                claimant_id,
                message
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                itemId,
                claimantId,
                message.trim(),
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Claim submitted successfully",
            data: result.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "You have already submitted a claim for this item",
            });
        }

        console.error("Create claim error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getClaimsForItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const ownerId = req.user.userId;

        const itemResult = await pool.query(
            `
            SELECT id, user_id
            FROM items
            WHERE id = $1
            `,
            [itemId]
        );

        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        if (itemResult.rows[0].user_id !== ownerId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view these claims",
            });
        }

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.item_id,
                c.claimant_id,
                c.message,
                c.status,
                c.owner_response,
                c.created_at,
                c.updated_at,
                u.name AS claimant_name,
                u.email AS claimant_email,
                u.profile_image_url AS claimant_profile_image
            FROM claims c
            JOIN users u
                ON u.id = c.claimant_id
            WHERE c.item_id = $1
            ORDER BY c.created_at DESC
            `,
            [itemId]
        );

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Get item claims error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const updateClaimStatus = async (req, res) => {
    const client = await pool.connect();

    try {
        const { claimId } = req.params;
        const { status, ownerResponse } = req.body;
        const ownerId = req.user.userId;

        await client.query("BEGIN");

        const claimResult = await client.query(
            `
            SELECT
                c.id,
                c.item_id,
                c.claimant_id,
                c.status,
                i.user_id AS owner_id,
                i.status AS item_status
            FROM claims c
            JOIN items i
                ON i.id = c.item_id
            WHERE c.id = $1
            FOR UPDATE OF c, i
            `,
            [claimId]
        );

        if (claimResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Claim not found",
            });
        }

        const claim = claimResult.rows[0];

        if (claim.owner_id !== ownerId) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this claim",
            });
        }

        if (claim.status !== "PENDING") {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Only pending claims can be updated",
            });
        }

        if (
            status === "ACCEPTED" &&
            claim.item_status !== "ACTIVE"
        ) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "This item already has an accepted claim",
            });
        }

        const updateResult = await client.query(
            `
            UPDATE claims
            SET
                status = $1,
                owner_response = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
            `,
            [
                status,
                ownerResponse?.trim() || null,
                claimId,
            ]
        );

        if (status === "ACCEPTED") {
            await client.query(
                `
                UPDATE claims
                SET
                    status = 'REJECTED',
                    updated_at = CURRENT_TIMESTAMP
                WHERE item_id = $1
                  AND id <> $2
                  AND status = 'PENDING'
                `,
                [
                    claim.item_id,
                    claimId,
                ]
            );

            await client.query(
                `
                UPDATE items
                SET
                    status = 'CLAIMED',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                `,
                [claim.item_id]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message:
                status === "ACCEPTED"
                    ? "Claim accepted successfully"
                    : "Claim rejected successfully",
            data: updateResult.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Update claim status error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        client.release();
    }
};

const getMyClaims = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `
            SELECT
                c.id,
                c.item_id,
                c.message,
                c.status,
                c.owner_response,
                c.created_at,
                c.updated_at,

                i.title AS item_title,
                i.type AS item_type,
                i.status AS item_status,
                i.location_name,

                u.name AS owner_name,

                (
                    SELECT image_url
                    FROM item_images
                    WHERE item_id = i.id
                    ORDER BY sort_order ASC, created_at ASC
                    LIMIT 1
                ) AS primary_image

            FROM claims c

            JOIN items i
                ON i.id = c.item_id

            JOIN users u
                ON u.id = i.user_id

            WHERE c.claimant_id = $1

            ORDER BY c.created_at DESC
            `,
            [userId]
        );

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("Get my claims error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const cancelClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `
            UPDATE claims
            SET
                status = 'CANCELLED',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
              AND claimant_id = $2
              AND status = 'PENDING'
            RETURNING *
            `,
            [
                claimId,
                userId,
            ]
        );

        if (result.rows.length === 0) {
            const claimCheck = await pool.query(
                `
                SELECT id, claimant_id, status
                FROM claims
                WHERE id = $1
                `,
                [claimId]
            );

            if (claimCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Claim not found",
                });
            }

            if (
                claimCheck.rows[0].claimant_id !==
                userId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to cancel this claim",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Only pending claims can be cancelled",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Claim cancelled successfully",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Cancel claim error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createClaim,
    getClaimsForItem,
    updateClaimStatus,
    getMyClaims,
    cancelClaim,
};