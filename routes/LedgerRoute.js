/**
 * @swagger
 * tags:
 *   name: Swagger
 *   description: Routes for Swagger demo
 */

const express = require("express");
const router = express.Router();
// controller
const LedgerController = require("../controller/LedgerController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * /createLedger:
 *   post:
 *     summary: Create a new ledger entry.
 *     description: Endpoint to create a new ledger entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *               // For example:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully created a ledger entry.
 *       400:
 *         description: Invalid request body.
 *       500:
 *         description: Internal server error.
 */
router.post("/createLedger", LedgerController.create);

/**
 * @swagger
 * /getAllLedger:
 *   get:
 *     summary: Get all ledger entries.
 *     description: Endpoint to get all ledger entries.
 *     responses:
 *       200:
 *         description: Successfully retrieved all ledger entries.
 *       500:
 *         description: Internal server error.
 */
router.get("/getAllLedger", LedgerController.getAll);

/**
 * @swagger
 * /ledgerById:
 *   get:
 *     summary: Get a ledger entry by ID.
 *     description: Endpoint to get a ledger entry by its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the ledger entry.
 *       404:
 *         description: Ledger entry not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/ledgerById", LedgerController.getById);

/**
 * @swagger
 * /searchLedger:
 *   post:
 *     summary: Search ledger entries.
 *     description: Endpoint to search ledger entries based on criteria.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your search criteria here
 *               // For example:
 *               keyword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the search results.
 *       500:
 *         description: Internal server error.
 */
router.post("/searchLedger", LedgerController.search);

module.exports = router;
