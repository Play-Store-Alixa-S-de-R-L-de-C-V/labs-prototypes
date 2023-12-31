/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";

const board = new Board();
const kit = board.addKit(Starter);

// Store input node so that we can refer back to it to create a conversation
// loop.
const input = board.input();

// Store prompt node for the same reason.
const prompt = kit.textTemplate(
  "This is a conversation between a friendly assistant and their user. You are the assistant and your job is to try to be helpful, empathetic, and fun.\n\n== Conversation History\n{{context}}\n\n== Current Conversation\nuser: {{question}}\nassistant:",
  { context: "" }
);

const conversationMemory = kit.localMemory();

board.passthrough({ $id: "start" }).wire(
  "->",
  input
    .wire(
      "text->question",
      prompt.wire(
        "prompt->text",
        kit
          .textCompletion()
          .wire("<-API_KEY.", kit.secrets(["API_KEY"]))
          .wire(
            "completion->assistant",
            conversationMemory.wire("context", prompt)
          )
          .wire("completion->text", board.output().wire("->", input))
      )
    )
    .wire("text->user", conversationMemory)
);

export default board;
