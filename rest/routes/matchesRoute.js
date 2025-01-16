/**
 * @swagger
 * components:
 *   schemas:
 *     Goal:
 *       type: object
 *       required:
 *         - scorer
 *         - minute
 *       properties:
 *         scorer:
 *           type: string
 *           format: objectId
 *           description: Reference to Player model
 *         assistant:
 *           type: string
 *           format: objectId
 *           description: Reference to Player model (optional)
 *         minute:
 *           type: number
 *           minimum: 1
 *           maximum: 120
 *           description: Minute when the goal was scored
 *         description:
 *           type: string
 *           description: Optional description of the goal
 *
 *     Substitution:
 *       type: object
 *       required:
 *         - playerIn
 *         - playerOut
 *         - minute
 *       properties:
 *         playerIn:
 *           type: string
 *           format: objectId
 *           description: Reference to Player model for player coming on
 *         playerOut:
 *           type: string
 *           format: objectId
 *           description: Reference to Player model for player going off
 *         minute:
 *           type: number
 *           minimum: 1
 *           maximum: 120
 *           description: Minute when substitution occurred
 *
 *     LineupPlayer:
 *       type: object
 *       required:
 *         - player
 *       properties:
 *         player:
 *           type: string
 *           format: objectId
 *           description: Reference to Player model
 *
 *     Lineup:
 *       type: object
 *       properties:
 *         starting:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LineupPlayer'
 *           minItems: 11
 *           maxItems: 11
 *           description: Must contain exactly 11 players
 *         substitutes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LineupPlayer'
 *           description: List of substitute players
 *         substitutions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Substitution'
 *           description: List of substitutions made during the match
 *
 *     Match:
 *       type: object
 *       required:
 *         - season
 *         - competition
 *         - date
 *         - stadium
 *         - opponent
 *         - lineup
 *         - referee
 *       properties:
 *         season:
 *           type: string
 *           format: objectId
 *           description: Reference to Season model
 *         competition:
 *           type: string
 *           format: objectId
 *           description: Reference to Competition model
 *         date:
 *           type: string
 *           format: date-time
 *           description: Match date (cannot be in future)
 *         stadium:
 *           type: string
 *           format: objectId
 *           description: Reference to Stadium model
 *         opponent:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *             manager:
 *               type: string
 *         score:
 *           type: object
 *           properties:
 *             home:
 *               type: number
 *               minimum: 0
 *               default: 0
 *             away:
 *               type: number
 *               minimum: 0
 *               default: 0
 *         home:
 *           type: boolean
 *         lineup:
 *           $ref: '#/components/schemas/Lineup'
 *         goals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Goal'
 *         referee:
 *           type: object
 *           required:
 *             - main
 *           properties:
 *             main:
 *               type: string
 *             assistants:
 *               type: array
 *               items:
 *                 type: string
 *             fourth:
 *               type: string
 *
 *     MatchRequest:
 *        type: object
 *        required:
 *          - season
 *          - competition
 *          - date
 *          - stadium
 *          - opponent
 *          - lineup
 *          - referee
 *        properties:
 *          season:
 *            type: string
 *            format: objectId
 *            description: Reference to Season model
 *          competition:
 *            type: string
 *            format: objectId
 *            description: Reference to Competition model
 *          date:
 *            type: string
 *            format: date-time
 *            description: Match date (cannot be in future)
 *          stadium:
 *            type: string
 *            format: objectId
 *            description: Reference to Stadium model
 *          opponent:
 *            type: object
 *            required:
 *              - name
 *            properties:
 *              name:
 *                type: string
 *              manager:
 *                type: string
 *          score:
 *            type: object
 *            properties:
 *              home:
 *                type: number
 *                minimum: 0
 *                default: 0
 *              away:
 *                type: number
 *                minimum: 0
 *                default: 0
 *          home:
 *            type: boolean
 *          referee:
 *            type: object
 *            required:
 *              - main
 *            properties:
 *              main:
 *                type: string
 *              assistants:
 *                type: array
 *                items:
 *                  type: string
 *              fourth:
 *                type: string
 *
 *   responses:
 *     MatchResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Match'
 *         _links:
 *           type: object
 *           properties:
 *             self:
 *               type: string
 *             collection:
 *               type: string
 */

import express from 'express';
import { Match } from '../models/Match.js';
import { validateObjectId, validateAllowedFields, validateReferences } from '../middleware/validators.js';

export const matchesRouter = express.Router();

const ALLOWED_FIELDS = [
    'season', 'competition', 'date', 'stadium', 'home',
    'opponent', 'opponent.name', 'opponent.manager',
    'score', 'score.home', 'score.away',
    'referee', 'referee.main', 'referee.assistants', 'referee.fourth'
];

const ALLOWED_GOAL_FIELDS = ['scorer', 'assistant', 'minute', 'description'];
const ALLOWED_SUBSTITUTION_FIELDS = ['playerIn', 'playerOut', 'minute'];
const ALLOWED_LINEUP_STARTING_FIELDS = ['player'];
const ALLOWED_LINEUP_SUBSTITUTE_FIELDS = ['player'];

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of matches
 *         headers:
 *           X-Total-Count:
 *             description: Total number of matches
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       204:
 *         description: No matches found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/', async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('season', 'years')
            .populate('competition', 'name')
            .populate('stadium', 'name');

        res.setHeader('X-Total-Count', matches.length);
        res.setHeader('X-Resource-Type', 'Match');

        if (matches.length === 0) {
            return res.status(204).end();//wymien 404
        }

        res.status(200).json({
            data: matches.map(match => ({
                ...match.toObject(),
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    season: match.season ? `/api/v1/seasons/${match.season._id}` : null,
                    competition: match.competition ? `/api/v1/competitions/${match.competition._id}` : null,
                    stadium: match.stadium ? `/api/v1/stadiums/${match.stadium._id}` : null,
                    goals: `/api/v1/matches/${match._id}/goals`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                }
            })),
            _links: {
                self: '/api/v1/matches'
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            _links: { self: '/api/v1/matches' }
        });
    }
});

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/MatchResponse'
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('season', 'years')
                .populate('competition', 'name')
                .populate('stadium', 'name')
                .populate('lineup.starting.player', 'name')
                .populate('lineup.substitutes.player', 'name')
                .populate('lineup.substitutions.playerIn', 'name')
                .populate('lineup.substitutions.playerOut', 'name')
                .populate('goals.scorer', 'name')
                .populate('goals.assistant', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: match.season ? `/api/v1/seasons/${match.season._id}` : null,
                    competition: match.competition ? `/api/v1/competitions/${match.competition._id}` : null,
                    stadium: match.stadium ? `/api/v1/stadiums/${match.stadium._id}` : null,
                    goals: `/api/v1/matches/${match._id}/goals`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Create new match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchRequest'
 *     responses:
 *       201:
 *         description: Match created
 *         headers:
 *           Location:
 *             description: URL of created match
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/MatchResponse'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
matchesRouter.post('/',
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'season': 'Season',
        'competition': 'Competition',
        'stadium': 'Stadium',
    }),
    async (req, res) => {
        try {
            const newMatch = new Match({
                ...req.body,
                lineup: {
                    starting: [],
                    substitutes: [],
                    substitutions: []
                }
            });
            await newMatch.save();

            res.setHeader('Location', `/api/v1/matches/${newMatch._id}`);
            res.setHeader('X-Resource-Type', 'Match');

            res.status(201).json({
                data: newMatch,
                _links: {
                    self: `/api/v1/matches/${newMatch._id}`,
                    collection: '/api/v1/matches',
                    season: newMatch.season ? `/api/v1/seasons/${newMatch.season._id}` : null,
                    competition: newMatch.competition ? `/api/v1/competitions/${newMatch.competition._id}` : null,
                    stadium: newMatch.stadium ? `/api/v1/stadiums/${newMatch.stadium._id}` : null,
                    goals: `/api/v1/matches/${newMatch._id}/goals`,
                    lineup: `/api/v1/matches/${newMatch._id}/lineup`,
                    substitutions: `/api/v1/matches/${newMatch._id}/lineup/substitutions`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}:
 *   put:
 *     summary: Update match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchRequest'
 *     responses:
 *       200:
 *         description: Match updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/MatchResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.put('/:matchId',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'season': 'Season',
        'competition': 'Competition',
        'stadium': 'Stadium',
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            const savedFields = {
                goals: match.goals,
                lineup: match.lineup
            };

            ALLOWED_FIELDS.forEach(field => {
                const [parent, child] = field.split('.');
                if (child) {
                    if (!match[parent]) match[parent] = {};
                    match[parent][child] = undefined;
                } else {
                    match[field] = undefined;
                }
            });

            Object.assign(match, req.body);
            match.goals = savedFields.goals;
            match.lineup = savedFields.lineup;

            await match.save();
            await match.populate(['season', 'competition', 'stadium']);

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: match.season ? `/api/v1/seasons/${match.season._id}` : null,
                    competition: match.competition ? `/api/v1/competitions/${match.competition._id}` : null,
                    stadium: match.stadium ? `/api/v1/stadiums/${match.stadium._id}` : null,
                    goals: `/api/v1/matches/${match._id}/goals`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}:
 *   patch:
 *     summary: Partially update match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/MatchRequest'
 *     responses:
 *       200:
 *         description: Match updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/MatchResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.patch('/:matchId',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_FIELDS),
    validateReferences({
        'season': 'Season',
        'competition': 'Competition',
        'stadium': 'Stadium',
    }),
    async (req, res) => {
        try {
            const match = await Match.findByIdAndUpdate(
                req.params.matchId,
                { $set: req.body },
                { new: true, runValidators: true }
            )
                .populate('season', 'years')
                .populate('competition', 'name')
                .populate('stadium', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match,
                _links: {
                    self: `/api/v1/matches/${match._id}`,
                    collection: '/api/v1/matches',
                    season: match.season ? `/api/v1/seasons/${match.season._id}` : null,
                    competition: match.competition ? `/api/v1/competitions/${match.competition._id}` : null,
                    stadium: match.stadium ? `/api/v1/stadiums/${match.stadium._id}` : null,
                    goals: `/api/v1/matches/${match._id}/goals`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}:
 *   delete:
 *     summary: Delete match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       204:
 *         description: Match deleted
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.delete('/:matchId',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findByIdAndDelete(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Match');
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/goals:
 *   get:
 *     summary: Get all goals for a match
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: List of goals
 *         headers:
 *           X-Total-Count:
 *             description: Total number of goals
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Goal'
 *       204:
 *         description: No goals found
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/goals',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('goals.scorer', 'name')
                .populate('goals.assistant', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Total-Count', match.goals.length);
            res.setHeader('X-Resource-Type', 'Goal');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            if (match.goals.length === 0) {
                return res.status(204).end();
            }

            res.status(200).json({
                data: match.goals.map((goal, index) => ({
                    ...goal.toObject(),
                    _links: {
                        self: `/api/v1/matches/${match._id}/goals/${index}`,
                        match: `/api/v1/matches/${match._id}`,
                        scorer: goal.scorer ? `/api/v1/players/${goal.scorer._id}` : null,
                        ...(goal.assistant && { assistant: `/api/v1/players/${goal.assistant._id}` })
                    }
                })),
                _links: {
                    self: `/api/v1/matches/${match._id}/goals`,
                    match: `/api/v1/matches/${match._id}`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/goals/{goalIndex}:
 *   get:
 *     summary: Get specific goal from match
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: goalIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goal index in array
 *     responses:
 *       200:
 *         description: Goal found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Match or goal not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/goals/:goalIndex',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('goals.scorer', 'name')
                .populate('goals.assistant', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            const goalIndex = parseInt(req.params.goalIndex);
            if (goalIndex >= match.goals.length || goalIndex < 0) {
                return res.status(404).json({
                    error: 'Goal not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        goals: `/api/v1/matches/${match._id}/goals`
                    }
                });
            }

            const goal = match.goals[goalIndex];

            res.setHeader('X-Resource-Type', 'Goal');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: goal,
                _links: {
                    self: `/api/v1/matches/${match._id}/goals/${goalIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    collection: `/api/v1/matches/${match._id}/goals`,
                    scorer: goal.scorer ? `/api/v1/players/${goal.scorer._id}` : null,
                    ...(goal.assistant && { assistant: `/api/v1/players/${goal.assistant._id}` })
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/goals:
 *   post:
 *     summary: Add goal to match
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       201:
 *         description: Goal created
 *         headers:
 *           Location:
 *             description: URL of created goal
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.post('/:matchId/goals',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_GOAL_FIELDS),
    validateReferences({
        'scorer': 'Player',
        'assistant': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            match.goals.push(req.body);
            await match.save();

            const newGoalIndex = match.goals.length - 1;
            const newGoal = match.goals[newGoalIndex];

            res.setHeader('Location', `/api/v1/matches/${match._id}/goals/${newGoalIndex}`);
            res.setHeader('X-Resource-Type', 'Goal');

            res.status(201).json({
                data: newGoal,
                _links: {
                    self: `/api/v1/matches/${match._id}/goals/${newGoalIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    collection: `/api/v1/matches/${match._id}/goals`,
                    scorer: newGoal.scorer ? `/api/v1/players/${newGoal.scorer}` : null,
                    ...(newGoal.assistant && { assistant: `/api/v1/players/${newGoal.assistant}` })
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/goals/{goalIndex}:
 *   put:
 *     summary: Update specific goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: goalIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goal index in array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 *     responses:
 *       200:
 *         description: Goal updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match or goal not found
 *       500:
 *         description: Server error
 */
matchesRouter.put('/:matchId/goals/:goalIndex',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_GOAL_FIELDS),
    validateReferences({
        'scorer': 'Player',
        'assistant': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);
            const goalIndex = parseInt(req.params.goalIndex);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (goalIndex >= match.goals.length || goalIndex < 0) {
                return res.status(404).json({
                    error: 'Goal not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        goals: `/api/v1/matches/${match._id}/goals`
                    }
                });
            }

            match.goals[goalIndex] = req.body;
            await match.save();

            res.setHeader('X-Resource-Type', 'Goal');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match.goals[goalIndex],
                _links: {
                    self: `/api/v1/matches/${match._id}/goals/${goalIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    collection: `/api/v1/matches/${match._id}/goals`,
                    scorer: match.goals[goalIndex].scorer ? `/api/v1/players/${match.goals[goalIndex].scorer}` : null,
                    ...(match.goals[goalIndex].assistant && {
                        assistant: `/api/v1/players/${match.goals[goalIndex].assistant}`
                    })
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/goals/{goalIndex}:
 *   delete:
 *     summary: Delete specific goal
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: goalIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goal index in array
 *     responses:
 *       204:
 *         description: Goal deleted
 *       404:
 *         description: Match or goal not found
 *       500:
 *         description: Server error
 */
matchesRouter.delete('/:matchId/goals/:goalIndex',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);
            const goalIndex = parseInt(req.params.goalIndex);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (goalIndex >= match.goals.length || goalIndex < 0) {
                return res.status(404).json({
                    error: 'Goal not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        goals: `/api/v1/matches/${match._id}/goals`
                    }
                });
            }

            match.goals.splice(goalIndex, 1);
            await match.save();

            res.setHeader('X-Resource-Type', 'Goal');
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup:
 *   get:
 *     summary: Get match lineup
 *     tags: [Lineup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match lineup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Lineup'
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/lineup',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('lineup.starting.player', 'name')
                .populate('lineup.substitutes.player', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Lineup');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: match.lineup,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup`,
                    match: `/api/v1/matches/${match._id}`,
                    starting: `/api/v1/matches/${match._id}/lineup/starting`,
                    substitutes: `/api/v1/matches/${match._id}/lineup/substitutes`,
                    substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/starting:
 *   get:
 *     summary: Get starting lineup
 *     tags: [Lineup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Starting lineup found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LineupPlayer'
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/lineup/starting',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('lineup.starting.player', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Starting Lineup');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: match.lineup.starting,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/starting`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/starting:
 *   put:
 *     summary: Update starting lineup
 *     tags: [Lineup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/LineupPlayer'
 *             minItems: 11
 *             maxItems: 11
 *     responses:
 *       200:
 *         description: Starting lineup updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LineupPlayer'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.put('/:matchId/lineup/starting',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_LINEUP_STARTING_FIELDS),
    validateReferences({
        'player': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (!Array.isArray(req.body) || req.body.length !== 11) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Starting lineup must contain exactly 11 players',
                    _links: { match: `/api/v1/matches/${match._id}` }
                });
            }

            match.lineup.starting = req.body;
            await match.save();

            res.setHeader('X-Resource-Type', 'Starting Lineup');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match.lineup.starting,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/starting`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/substitutes:
 *   get:
 *     summary: Get substitute players
 *     tags: [Lineup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Substitutes found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LineupPlayer'
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/lineup/substitutes',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('lineup.substitutes.player', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Resource-Type', 'Substitutes');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: match.lineup.substitutes,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutes`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/substitutes:
 *   put:
 *     summary: Update all substitute players
 *     tags: [Lineup]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/LineupPlayer'
 *     responses:
 *       200:
 *         description: Substitutes updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LineupPlayer'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.put('/:matchId/lineup/substitutes',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_LINEUP_SUBSTITUTE_FIELDS),
    validateReferences({
        'player': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (!Array.isArray(req.body)) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Request body must be an array',
                    _links: { match: `/api/v1/matches/${match._id}` }
                });
            }

            match.lineup.substitutes = req.body;
            await match.save();

            res.setHeader('X-Resource-Type', 'Substitutes');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match.lineup.substitutes,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutes`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });


/**
 * @swagger
 * /matches/{id}/lineup/substitutions:
 *   get:
 *     summary: Get all substitutions for a match
 *     tags: [Substitutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: List of substitutions
 *         headers:
 *           X-Total-Count:
 *             description: Total number of substitutions
 *             schema:
 *               type: integer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Substitution'
 *       204:
 *         description: No substitutions found
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/lineup/substitutions',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('lineup.substitutions.playerIn', 'name')
                .populate('lineup.substitutions.playerOut', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            res.setHeader('X-Total-Count', match.lineup.substitutions.length);
            res.setHeader('X-Resource-Type', 'Substitution');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            if (match.lineup.substitutions.length === 0) {
                return res.status(204).end();
            }

            res.status(200).json({
                data: match.lineup.substitutions.map((sub, index) => ({
                    ...sub.toObject(),
                    _links: {
                        self: `/api/v1/matches/${match._id}/lineup/substitutions/${index}`,
                        match: `/api/v1/matches/${match._id}`,
                        lineup: `/api/v1/matches/${match._id}/lineup`,
                        playerIn: sub.playerIn._id ?`/api/v1/players/${sub.playerIn._id}` : null,
                        playerOut: sub.playerOut._id ? `/api/v1/players/${sub.playerOut._id}` : null
                    }
                })),
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutions`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/substitutions/{substitutionIndex}:
 *   get:
 *     summary: Get specific substitution from match
 *     tags: [Substitutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: substitutionIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Substitution index in array
 *     responses:
 *       200:
 *         description: Substitution found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Substitution'
 *       404:
 *         description: Match or substitution not found
 *       500:
 *         description: Server error
 */
matchesRouter.get('/:matchId/lineup/substitutions/:substitutionIndex',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId)
                .populate('lineup.substitutions.playerIn', 'name')
                .populate('lineup.substitutions.playerOut', 'name');

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            const substitutionIndex = parseInt(req.params.substitutionIndex);
            if (substitutionIndex >= match.lineup.substitutions.length || substitutionIndex < 0) {
                return res.status(404).json({
                    error: 'Substitution not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                    }
                });
            }

            const substitution = match.lineup.substitutions[substitutionIndex];


            res.setHeader('X-Resource-Type', 'Substitution');
            res.setHeader('Last-Modified', match.updatedAt.toUTCString());

            res.status(200).json({
                data: substitution,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutions/${substitutionIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    collection: `/api/v1/matches/${match._id}/lineup/substitutions`,
                    playerIn: substitution.playerIn ? `/api/v1/players/${substitution.playerIn._id}` : null,
                    playerOut: substitution.playerOut._id ? `/api/v1/players/${substitution.playerOut._id}` : null
                }
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/substitutions:
 *   post:
 *     summary: Add substitution to match
 *     tags: [Substitutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Substitution'
 *     responses:
 *       201:
 *         description: Substitution created
 *         headers:
 *           Location:
 *             description: URL of created substitution
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Substitution'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match not found
 *       500:
 *         description: Server error
 */
matchesRouter.post('/:matchId/lineup/substitutions',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_SUBSTITUTION_FIELDS),
    validateReferences({
        'playerIn': 'Player',
        'playerOut': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            match.lineup.substitutions.push(req.body);
            await match.save();

            const newSubstitutionIndex = match.lineup.substitutions.length - 1;
            const newSubstitution = match.lineup.substitutions[newSubstitutionIndex];

            res.setHeader('Location', `/api/v1/matches/${match._id}/lineup/substitutions/${newSubstitutionIndex}`);
            res.setHeader('X-Resource-Type', 'Substitution');

            res.status(201).json({
                data: newSubstitution,
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutions/${newSubstitutionIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    collection: `/api/v1/matches/${match._id}/lineup/substitutions`,
                    playerIn: newSubstitution.playerIn ? `/api/v1/players/${newSubstitution.playerIn}` : null,
                    playerOut: newSubstitution.playerIn ? `/api/v1/players/${newSubstitution.playerOut}` : null
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });


/**
 * @swagger
 * /matches/{id}/lineup/substitutions/{substitutionIndex}:
 *   put:
 *     summary: Update specific substitution
 *     tags: [Substitutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: substitutionIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Substitution index in array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Substitution'
 *     responses:
 *       200:
 *         description: Substitution updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Substitution'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Match or substitution not found
 *       500:
 *         description: Server error
 */
matchesRouter.put('/:matchId/lineup/substitutions/:substitutionIndex',
    validateObjectId('matchId'),
    validateAllowedFields(ALLOWED_SUBSTITUTION_FIELDS),
    validateReferences({
        'playerIn': 'Player',
        'playerOut': 'Player'
    }),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);
            const substitutionIndex = parseInt(req.params.substitutionIndex);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (substitutionIndex >= match.lineup.substitutions.length || substitutionIndex < 0) {
                return res.status(404).json({
                    error: 'Substitution not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                    }
                });
            }

            match.lineup.substitutions[substitutionIndex] = req.body;
            await match.save();

            res.setHeader('X-Resource-Type', 'Substitution');
            res.setHeader('Last-Modified', new Date().toUTCString());

            res.status(200).json({
                data: match.lineup.substitutions[substitutionIndex],
                _links: {
                    self: `/api/v1/matches/${match._id}/lineup/substitutions/${substitutionIndex}`,
                    match: `/api/v1/matches/${match._id}`,
                    lineup: `/api/v1/matches/${match._id}/lineup`,
                    collection: `/api/v1/matches/${match._id}/lineup/substitutions`,
                    playerIn: match.lineup.substitutions[substitutionIndex].playerIn ? `/api/v1/players/${match.lineup.substitutions[substitutionIndex].playerIn}`: null,
                    playerOut: match.lineup.substitutions[substitutionIndex].playerOut ? `/api/v1/players/${match.lineup.substitutions[substitutionIndex].playerOut}` : null
                }
            });
        } catch (error) {
            if (error.name === 'ValidationError' || error.name === 'BusinessLogicError') {
                return res.status(400).json({
                    error: error.name,
                    message: error.message,
                    _links: { collection: '/api/v1/matches' }
                });
            }
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });

/**
 * @swagger
 * /matches/{id}/lineup/substitutions/{substitutionIndex}:
 *   delete:
 *     summary: Delete specific substitution
 *     tags: [Substitutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: path
 *         name: substitutionIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Substitution index in array
 *     responses:
 *       204:
 *         description: Substitution deleted
 *       404:
 *         description: Match or substitution not found
 *       500:
 *         description: Server error
 */
matchesRouter.delete('/:matchId/lineup/substitutions/:substitutionIndex',
    validateObjectId('matchId'),
    async (req, res) => {
        try {
            const match = await Match.findById(req.params.matchId);
            const substitutionIndex = parseInt(req.params.substitutionIndex);

            if (!match) {
                return res.status(404).json({
                    error: 'Match not found',
                    _links: { collection: '/api/v1/matches' }
                });
            }

            if (substitutionIndex >= match.lineup.substitutions.length || substitutionIndex < 0) {
                return res.status(404).json({
                    error: 'Substitution not found',
                    _links: {
                        match: `/api/v1/matches/${match._id}`,
                        substitutions: `/api/v1/matches/${match._id}/lineup/substitutions`
                    }
                });
            }

            match.lineup.substitutions.splice(substitutionIndex, 1);
            await match.save();

            res.setHeader('X-Resource-Type', 'Substitution');
            res.setHeader('X-Deleted-At', new Date().toUTCString());

            res.status(204).end();
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                _links: { collection: '/api/v1/matches' }
            });
        }
    });