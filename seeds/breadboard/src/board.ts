/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Edge,
  NodeDescriptor,
  GraphTraversalContext,
  NodeHandlers,
  InputValues,
  GraphDescriptor,
  OutputValues,
} from "@google-labs/graph-runner";

import {
  BreadboardRunStage,
  type Breadboard,
  type BreadboardSlotSpec,
  type BreadbordRunResult,
  type Kit,
  type KitConstructor,
  type OptionalIdConfiguration,
} from "./types.js";

import { loadGraph, TraversalMachine } from "@google-labs/graph-runner";
import { Node } from "./node.js";
import { Starter } from "./starter.js";
import { Core } from "./core.js";
import { InputStageResult, OutputStageResult } from "./run.js";

export class Board extends EventTarget implements Breadboard {
  edges: Edge[] = [];
  nodes: NodeDescriptor[] = [];
  #kits: Kit[] = [];
  #inputs: InputValues = {};
  #slots: BreadboardSlotSpec = {};

  async *run(): AsyncGenerator<BreadbordRunResult> {
    const core = new Core(this, this.#slots, {
      getInputs: () => this.#inputs,
    });
    const kits = [core, ...this.#kits];
    const handlers = kits.reduce((handlers, kit) => {
      return { ...handlers, ...kit.handlers };
    }, {} as NodeHandlers);

    const machine = new TraversalMachine(this);

    // TODO: Remove this after GraphTraversalContext is gone.
    const dummyContext = null as unknown as GraphTraversalContext;

    for await (const result of machine) {
      const { inputs, descriptor } = result;

      if (result.skip) continue;

      if (descriptor.type === "input") {
        const inputStage = new InputStageResult(inputs);
        yield inputStage;
        result.outputs = inputStage.inputs;
        continue;
      }

      if (descriptor.type === "output") {
        yield new OutputStageResult(inputs);
        continue;
      }

      const handler = handlers[descriptor.type];
      if (!handler)
        throw new Error(`No handler for node type "${descriptor.type}"`);

      const outputs = (await handler(dummyContext, inputs)) || {};
      this.dispatchEvent(
        new CustomEvent("log", {
          detail: {
            descriptor,
            inputs,
            outputs,
          },
        })
      );

      result.outputs = outputs;
    }
  }

  async runOnce(inputs: InputValues): Promise<OutputValues> {
    let outputs: OutputValues = {};
    for await (const result of this.run()) {
      if (result.stage === BreadboardRunStage.Input) {
        result.inputs = inputs;
      } else {
        outputs = result.outputs;
        // Exit once we receive the first output.
        break;
      }
    }
    return outputs;
  }

  /**
   * Core nodes. Breadboard won't function without these.
   * These are always included.
   */

  input(message?: string, config: OptionalIdConfiguration = {}): Node {
    const { $id, ...rest } = config;
    return new Node(this, "input", { message, ...rest }, $id);
  }

  output(config: OptionalIdConfiguration = {}): Node {
    const { $id, ...rest } = config;
    return new Node(this, "output", { ...rest }, $id);
  }

  include($ref: string, config: OptionalIdConfiguration = {}): Node {
    const { $id, ...rest } = config;
    return new Node(this, "include", { $ref, ...rest }, $id);
  }

  reflect(config: OptionalIdConfiguration = {}): Node {
    const { $id, ...rest } = config;
    return new Node(this, "reflect", { ...rest }, $id);
  }

  slot(config: OptionalIdConfiguration = {}): Node {
    const { $id, ...rest } = config;
    return new Node(this, "slot", { ...rest }, $id);
  }

  addInputs(inputs: InputValues): void {
    this.#inputs = { ...this.#inputs, ...inputs };
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
  }

  addNode(node: NodeDescriptor): void {
    this.nodes.push(node);
  }

  addKit<T extends Kit>(ctr: KitConstructor<T>): T {
    const kit = new ctr((...args) => {
      return new Node(this, ...args);
    });
    this.#kits.push(kit);
    return kit;
  }

  on(eventName: string, handler: EventListenerOrEventListenerObject) {
    this.addEventListener(eventName, handler);
  }

  static fromGraphDescriptor(graph: GraphDescriptor): Board {
    const breadboard = new Board();
    breadboard.edges = graph.edges;
    breadboard.nodes = graph.nodes;
    // Later, we'll want to make this more flexible.
    // Currently, since there's only one kit, we just register it here.
    breadboard.addKit(Starter);
    return breadboard;
  }

  static async load($ref: string, slots?: BreadboardSlotSpec): Promise<Board> {
    const url = new URL($ref, new URL(import.meta.url));
    const path = url.protocol === "file:" ? $ref : undefined;
    const graph = await loadGraph(path, $ref);
    const board = Board.fromGraphDescriptor(graph);
    board.#slots = slots || {};
    return board;
  }
}
