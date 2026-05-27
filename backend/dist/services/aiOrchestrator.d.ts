type AIModel = 'gpt-4.1' | 'claude' | 'gemini' | 'deepseek';
interface ModelConfig {
    name: string;
    provider: string;
    costPer1kTokens: number;
    maxTokens: number;
    strengths: string[];
}
type RoutingStrategy = 'fast' | 'smart' | 'low_cost' | 'sales_optimized';
interface RoutingContext {
    strategy: RoutingStrategy;
    language: string;
    taskComplexity: 'low' | 'medium' | 'high';
    preferredModel?: AIModel;
}
export declare class AIOrchestrator {
    private openai;
    constructor();
    selectModel(context: RoutingContext): AIModel;
    generateResponse(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, model?: AIModel, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<{
        content: string;
        model: string;
        tokensUsed: number;
        cost: number;
    }>;
    generateCallScript(params: {
        industry: string;
        product: string;
        targetAudience: string;
        tone: string;
        language: string;
        objectives: string[];
    }): Promise<{
        opening: string;
        qualificationQuestions: string[];
        objectionHandlers: Record<string, string>;
        closing: string;
    }>;
    analyzeConversation(transcript: string): Promise<{
        sentiment: 'positive' | 'neutral' | 'negative';
        leadQualified: boolean;
        score: number;
        keyPoints: string[];
        suggestedFollowUp: string;
    }>;
    handleObjection(objection: string, context: {
        industry: string;
        product: string;
        language: string;
    }): Promise<string>;
    getModelInfo(model: AIModel): ModelConfig;
    getAvailableModels(): Array<{
        model: AIModel;
        config: ModelConfig;
    }>;
}
export declare const aiOrchestrator: AIOrchestrator;
export {};
//# sourceMappingURL=aiOrchestrator.d.ts.map