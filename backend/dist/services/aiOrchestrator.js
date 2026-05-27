"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiOrchestrator = exports.AIOrchestrator = void 0;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config");
const MODEL_REGISTRY = {
    'gpt-4.1': {
        name: 'gpt-4.1',
        provider: 'openai',
        costPer1kTokens: 0.03,
        maxTokens: 32768,
        strengths: ['reasoning', 'english', 'sales', 'complex_tasks'],
    },
    'claude': {
        name: 'claude-sonnet-4-20250514',
        provider: 'anthropic',
        costPer1kTokens: 0.015,
        maxTokens: 200000,
        strengths: ['reasoning', 'long_context', 'nuanced_responses', 'safety'],
    },
    'gemini': {
        name: 'gemini-2.0-flash',
        provider: 'google',
        costPer1kTokens: 0.005,
        maxTokens: 1048576,
        strengths: ['multilingual', 'fast', 'cost_effective', 'multimodal'],
    },
    'deepseek': {
        name: 'deepseek-chat',
        provider: 'deepseek',
        costPer1kTokens: 0.002,
        maxTokens: 32768,
        strengths: ['cost_effective', 'coding', 'fast'],
    },
};
class AIOrchestrator {
    openai;
    constructor() {
        this.openai = new openai_1.default({ apiKey: config_1.config.openai.apiKey });
    }
    selectModel(context) {
        if (context.preferredModel) {
            return context.preferredModel;
        }
        const nonEnglish = context.language !== 'en';
        switch (context.strategy) {
            case 'fast':
                return nonEnglish ? 'gemini' : 'deepseek';
            case 'low_cost':
                return 'deepseek';
            case 'smart':
                if (context.taskComplexity === 'high')
                    return 'gpt-4.1';
                if (nonEnglish)
                    return 'gemini';
                return 'claude';
            case 'sales_optimized':
                if (context.taskComplexity === 'high')
                    return 'gpt-4.1';
                if (nonEnglish)
                    return 'gemini';
                return 'gpt-4.1';
            default:
                return 'gpt-4.1';
        }
    }
    async generateResponse(messages, model = 'gpt-4.1', options = {}) {
        const modelConfig = MODEL_REGISTRY[model];
        // All models route through OpenAI-compatible API for MVP
        // In production, each provider gets its own client
        const response = await this.openai.chat.completions.create({
            model: modelConfig.name,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 1024,
        });
        const tokensUsed = response.usage?.total_tokens || 0;
        const cost = (tokensUsed / 1000) * modelConfig.costPer1kTokens;
        return {
            content: response.choices[0]?.message?.content || '',
            model: modelConfig.name,
            tokensUsed,
            cost,
        };
    }
    async generateCallScript(params) {
        const systemPrompt = `You are an expert sales script writer for ${params.industry}. 
Generate a natural, conversational call script in ${params.language === 'en' ? 'English' : params.language}.
The tone should be ${params.tone}.
The script should sound human and natural, not robotic.`;
        const userPrompt = `Create a call script for:
Product/Service: ${params.product}
Target Audience: ${params.targetAudience}
Objectives: ${params.objectives.join(', ')}

Generate:
1. An engaging opening (2-3 sentences)
2. 3-5 qualification questions
3. 5 common objections with responses
4. A strong closing statement

Return as JSON with keys: opening, qualificationQuestions (array), objectionHandlers (object), closing`;
        const model = this.selectModel({
            strategy: 'sales_optimized',
            language: params.language,
            taskComplexity: 'high',
        });
        const response = await this.generateResponse([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ], model, { temperature: 0.8 });
        try {
            return JSON.parse(response.content);
        }
        catch {
            return {
                opening: response.content,
                qualificationQuestions: [],
                objectionHandlers: {},
                closing: '',
            };
        }
    }
    async analyzeConversation(transcript) {
        const response = await this.generateResponse([
            {
                role: 'system',
                content: `Analyze this sales call transcript. Return JSON with:
- sentiment: "positive", "neutral", or "negative"
- leadQualified: boolean
- score: 0-100
- keyPoints: array of key findings
- suggestedFollowUp: recommended next action`,
            },
            { role: 'user', content: transcript },
        ], 'gpt-4.1', { temperature: 0.3 });
        try {
            return JSON.parse(response.content);
        }
        catch {
            return {
                sentiment: 'neutral',
                leadQualified: false,
                score: 50,
                keyPoints: [],
                suggestedFollowUp: 'Schedule a follow-up call',
            };
        }
    }
    async handleObjection(objection, context) {
        const model = this.selectModel({
            strategy: 'fast',
            language: context.language,
            taskComplexity: 'medium',
        });
        const response = await this.generateResponse([
            {
                role: 'system',
                content: `You are a skilled sales agent in the ${context.industry} industry selling ${context.product}. 
Respond to the customer's objection naturally and persuasively in 2-3 sentences. 
Be empathetic but guide toward a positive outcome.`,
            },
            { role: 'user', content: objection },
        ], model, { temperature: 0.7, maxTokens: 256 });
        return response.content;
    }
    getModelInfo(model) {
        return MODEL_REGISTRY[model];
    }
    getAvailableModels() {
        return Object.entries(MODEL_REGISTRY).map(([model, modelConfig]) => ({
            model: model,
            config: modelConfig,
        }));
    }
}
exports.AIOrchestrator = AIOrchestrator;
exports.aiOrchestrator = new AIOrchestrator();
//# sourceMappingURL=aiOrchestrator.js.map