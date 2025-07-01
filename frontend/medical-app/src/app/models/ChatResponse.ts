export interface ChatResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }