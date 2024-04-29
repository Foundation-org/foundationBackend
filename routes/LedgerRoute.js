const express = require("express");
const router = express.Router();
// controller
const LedgerController = require("../controller/LedgerController");
// middleware
const protect = require("../middleware/protect");

/**
 * @swagger
 * tags:
 *   name: Ledger
 *   description: Routes for Swagger demo
 */

router.post("/createLedger",
/**
   * @swagger
   * /ledger/createLedger:
   *   post:
   *     tags:
   *       - Ledger
   *     summary: Create Ledger.
   *     description: Endpoint to create a new ledger entry.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/OtpRequest'
   *     responses:
   *       200:
   *         description: Successfully created a ledger entry.
   *       400:
   *         description: Invalid request body.
   *       500:
   *         description: Internal server error.
   */
 LedgerController.create);

/**
 * @swagger
 * /ledger/getAllLedger:
 *   get:
 *     tags:
 *       - Ledger
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
 * /ledger/ledgerById:
 *   get:
 *     tags:
 *       - Ledger
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

router.post("/searchLedger",
/**
   * @swagger
   * /ledger/searchLedger:
   *   post:
   *     tags:
   *       - Ledger
   *     summary: Search Ledger.
   *     description: Endpoint to search ledger entries based on criteria.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: Object
   *     responses:
   *       200:
   *         description: Ledger found Successfully.
   *       400:
   *         description: Invalid request body.
   *       500:
   *         description: Internal server error.
   */
 LedgerController.search);

module.exports = router;
