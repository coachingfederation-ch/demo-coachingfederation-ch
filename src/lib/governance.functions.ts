/**
 * Public read path for the governance archive. Unauthenticated on purpose:
 * everything it returns is a published document meant for anyone to read.
 */
import { createServerFn } from "@tanstack/react-start";
import type { GovernanceDocument } from "./governance";

export const listGovernanceDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<GovernanceDocument[]> => {
    const { loadPublishedGovernanceDocuments } = await import("./governance.server");
    return loadPublishedGovernanceDocuments();
  },
);
