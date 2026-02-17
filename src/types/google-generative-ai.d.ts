declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: { model: string }): {
      generateContent(
        input: string | string[]
      ): Promise<{ response: { text(): string } }>;
    };
  }
}
