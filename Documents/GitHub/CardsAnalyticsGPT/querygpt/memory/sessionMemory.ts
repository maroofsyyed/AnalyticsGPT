/**
 * Session Memory — LangGraph MemorySaver checkpointer for multi-turn conversations
 * 
 * Enables follow-up queries like "now filter that to web channel only"
 * by persisting conversation state across invocations within a session.
 */

import { MemorySaver } from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";

// ── State ──────────────────────────────────────────────────────────

let checkpointer: MemorySaver | null = null;
let currentThreadId: string = "";

// ── Public API ─────────────────────────────────────────────────────

function initSession(): { checkpointer: MemorySaver; threadId: string } {
  checkpointer = new MemorySaver();
  currentThreadId = `thread_${uuidv4().slice(0, 8)}`;

  return {
    checkpointer,
    threadId: currentThreadId
  };
}

function getCheckpointer(): MemorySaver {
  if (!checkpointer) {
    const session = initSession();
    return session.checkpointer;
  }
  return checkpointer;
}

function getThreadId(): string {
  if (!currentThreadId) {
    initSession();
  }
  return currentThreadId;
}

function newThread(): string {
  currentThreadId = `thread_${uuidv4().slice(0, 8)}`;
  return currentThreadId;
}

// ── Export ──────────────────────────────────────────────────────────

const sessionMemory = {
  initSession,
  getCheckpointer,
  getThreadId,
  newThread
};

export default sessionMemory;
