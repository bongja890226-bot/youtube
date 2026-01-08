
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, GeneratedScript, ScriptAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

// 1단계: 대본 분석 및 주제 추천
export const analyzeScriptAndSuggestTopics = async (viralScript: string): Promise<AnalysisResponse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      유튜브 성장 전문가이자 작가로서 다음 떡상한 영상의 대본을 분석해주세요.
      1. 이 대본의 심리적 트리거, 구조, 페이싱, 도입부(Hook) 전략을 상세히 분석하세요.
      2. 이 대본의 스타일과 성공 공식을 적용하기 좋은 '새로운 유튜브 주제' 5가지를 추천하세요.
      
      대본:
      """
      ${viralScript}
      """
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.OBJECT,
            properties: {
              viralHook: { type: Type.STRING, description: "도입부 후킹 전략 분석" },
              pacingStyle: { type: Type.STRING, description: "전반적인 속도감 및 전개 방식" },
              retentionTriggers: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "시청 지속 시간을 높이는 핵심 요소들"
              },
              structureBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    section: { type: Type.STRING },
                    description: { type: Type.STRING },
                    timingWeight: { type: Type.NUMBER }
                  },
                  required: ["section", "description", "timingWeight"]
                }
              },
              emotionalArc: { type: Type.STRING, description: "시청자가 느끼는 감정의 변화 곡선" }
            },
            required: ["viralHook", "pacingStyle", "retentionTriggers", "structureBreakdown", "emotionalArc"]
          },
          suggestedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "추천하는 5가지 새로운 영상 주제"
          }
        },
        required: ["analysis", "suggestedTopics"]
      }
    }
  });

  return JSON.parse(response.text) as AnalysisResponse;
};

// 2단계: 분석된 구조를 바탕으로 새 대본 생성
export const generateNewScript = async (
  analysis: ScriptAnalysis,
  newTopic: string
): Promise<GeneratedScript> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `
      당신은 위 분석 결과로 도출된 '떡상 공식'을 그대로 사용하여 새로운 주제의 대본을 작성하는 작가입니다.
      
      [분석된 구조 및 스타일]
      - 후킹 전략: ${analysis.viralHook}
      - 페이싱: ${analysis.pacingStyle}
      - 시청 지속 트리거: ${analysis.retentionTriggers.join(", ")}
      - 구조: ${JSON.stringify(analysis.structureBreakdown)}
      
      [새로운 주제]
      ${newTopic}
      
      위의 성공 공식을 완벽하게 이식하여 새로운 대본을 작성하세요. 
      각 섹션별로 구체적인 대사와 함께 화면에 보여질 '시각적 연출 가이드'도 포함하세요.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "클릭을 유발하는 영상 제목" },
          hook: { type: Type.STRING, description: "강력한 도입부 대사" },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING, description: "섹션 제목" },
                content: { type: Type.STRING, description: "실제 말하는 대사 전문" },
                visualDirection: { type: Type.STRING, description: "화면 연출 및 자막 가이드" }
              },
              required: ["heading", "content", "visualDirection"]
            }
          },
          cta: { type: Type.STRING, description: "구독/좋아요를 유도하는 결말" }
        },
        required: ["title", "hook", "sections", "cta"]
      }
    }
  });

  return JSON.parse(response.text) as GeneratedScript;
};
