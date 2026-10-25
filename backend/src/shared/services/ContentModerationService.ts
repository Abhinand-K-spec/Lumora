import OpenAI from "openai";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../enums/HTTP.status.code";

export interface ContentModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
}

export interface IContentModerationService {
  moderatePost(
    caption: string,
    imageUrls: string[],
  ): Promise<ContentModerationResult>;
}

export class ContentModerationService
  implements IContentModerationService
{
  private readonly _client: OpenAI;

  constructor(apiKey: string | undefined = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      throw new AppError(HttpStatus.BAD_REQUEST,"OPENAI_API_KEY is not configured");
    }

    this._client = new OpenAI({ apiKey });
  }

  async moderatePost(
    caption: string,
    imageUrls: string[],
  ): Promise<ContentModerationResult> {
    const input: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [];

    if (caption.trim()) {
      input.push({
        type: "text",
        text: caption,
      });
    }

    for (const url of imageUrls) {
      input.push({
        type: "image_url",
        image_url: { url },
      });
    }

    if (input.length === 0) {
      return { flagged: false, categories: {} };
    }

    const response = await this._client.moderations.create({
      model: "omni-moderation-latest",
      input,
    });

    const result = response.results[0];

    if (!result) {
      throw new AppError(HttpStatus.BAD_REQUEST,"Moderation API returned no results");
    }

    return {
        flagged: result.flagged,
        categories: Object.fromEntries(
          Object.entries(result.categories)
        ) as Record<string, boolean>,
      };
  }
}
