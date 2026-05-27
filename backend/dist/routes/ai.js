"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const aiOrchestrator_1 = require("../services/aiOrchestrator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/models', async (_req, res) => {
    const models = aiOrchestrator_1.aiOrchestrator.getAvailableModels();
    (0, response_1.sendSuccess)(res, models);
});
router.post('/generate-script', async (req, res) => {
    const { industry, product, target_audience, tone, language, objectives } = req.body;
    try {
        const script = await aiOrchestrator_1.aiOrchestrator.generateCallScript({
            industry,
            product,
            targetAudience: target_audience,
            tone: tone || 'professional',
            language: language || 'en',
            objectives: objectives || ['qualify_lead'],
        });
        (0, response_1.sendSuccess)(res, script);
    }
    catch {
        (0, response_1.sendError)(res, 'AI_ERROR', 'Failed to generate script', 500);
    }
});
router.post('/analyze-transcript', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Transcript is required');
        return;
    }
    try {
        const analysis = await aiOrchestrator_1.aiOrchestrator.analyzeConversation(transcript);
        (0, response_1.sendSuccess)(res, analysis);
    }
    catch {
        (0, response_1.sendError)(res, 'AI_ERROR', 'Failed to analyze transcript', 500);
    }
});
router.post('/handle-objection', async (req, res) => {
    const { objection, industry, product, language } = req.body;
    if (!objection) {
        (0, response_1.sendError)(res, 'VALIDATION_ERROR', 'Objection text is required');
        return;
    }
    try {
        const response = await aiOrchestrator_1.aiOrchestrator.handleObjection(objection, {
            industry: industry || 'general',
            product: product || 'service',
            language: language || 'en',
        });
        (0, response_1.sendSuccess)(res, { response });
    }
    catch {
        (0, response_1.sendError)(res, 'AI_ERROR', 'Failed to generate response', 500);
    }
});
router.post('/test', async (req, res) => {
    const { model, prompt } = req.body;
    try {
        const response = await aiOrchestrator_1.aiOrchestrator.generateResponse([{ role: 'user', content: prompt }], model || 'gpt-4.1', { temperature: 0.7, maxTokens: 512 });
        (0, response_1.sendSuccess)(res, response);
    }
    catch {
        (0, response_1.sendError)(res, 'AI_ERROR', 'AI model test failed', 500);
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map