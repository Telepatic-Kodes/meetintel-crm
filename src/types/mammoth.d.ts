declare module 'mammoth' {
  export interface Result {
    value: string;
    messages: any[];
  }

  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<Result>;
}
