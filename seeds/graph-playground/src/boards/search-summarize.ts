/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";

const searchSummarize = new Board();
const kit = searchSummarize.addKit(Starter);

const completion = kit
  .textCompletion()
  .wire("completion->text", searchSummarize.output());

const summarizingTemplate = kit
  .textTemplate(
    "Use context below to answer this question:\n\n##Question:\n{{question}}\n\n## Context {{context}}\n\\n## Answer:\n",
    { $id: "summarizing-template" }
  )
  .wire("prompt->text", completion);

const searchURLTemplate = kit
  .urlTemplate(
    "https://www.googleapis.com/customsearch/v1?key={{API_KEY}}&cx={{GOOGLE_CSE_ID}}&q={{query}}"
  )
  .wire(
    "url",
    kit
      .fetch()
      .wire(
        "response->json",
        kit
          .jsonata("$join(items.snippet, '\n')")
          .wire("result->context", summarizingTemplate)
      )
  );

kit
  .secrets(["API_KEY", "GOOGLE_CSE_ID"])
  .wire("API_KEY", completion)
  .wire("API_KEY", searchURLTemplate)
  .wire("GOOGLE_CSE_ID", searchURLTemplate);

searchSummarize
  .input("What would you like to search for?", { $id: "input" })
  .wire("text->question", summarizingTemplate)
  .wire("text->query", searchURLTemplate);

export default searchSummarize;
