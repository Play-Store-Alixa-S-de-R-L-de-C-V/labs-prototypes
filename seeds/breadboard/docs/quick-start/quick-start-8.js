/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";
import { config } from "dotenv";

config();

const board = new Board();
// add kit to the board
const kit = board.addKit(Starter);

const output = board.output();
board.input().wire(
  "say->text",
  kit
    .textCompletion()
    .wire("completion->hear", output)
    .wire("<-API_KEY", kit.secrets(["API_KEY"]))
);

for await (const stop of board.run()) {
  if (stop.seeksInputs) {
    stop.inputs = { say: "Hi, how are you?" };
  } else {
    console.log("result", stop.outputs);
  }
}
