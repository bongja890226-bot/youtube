
export interface ScriptAnalysis {
  viralHook: string;
  pacingStyle: string;
  retentionTriggers: string[];
  structureBreakdown: {
    section: string;
    description: string;
    timingWeight: number; // 1-10
  }[];
  emotionalArc: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  sections: {
    heading: string;
    content: string;
    visualDirection: string;
  }[];
  cta: string;
}

export interface AnalysisResponse {
  analysis: ScriptAnalysis;
  suggestedTopics: string[];
}

export enum WorkflowStep {
  INPUT_SCRIPT = 'INPUT_SCRIPT',
  ANALYZING = 'ANALYZING',
  SELECT_TOPIC = 'SELECT_TOPIC',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}
