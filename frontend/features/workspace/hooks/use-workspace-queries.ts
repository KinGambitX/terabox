"use client";

import { useQuery } from "@tanstack/react-query";
import { getResults, getSubmissions } from "../api/workspace-api";

export const workspaceSubmissionsKey = ["workspace", "submissions"] as const;
export const workspaceResultsKey = ["workspace", "results"] as const;

export function useWorkspaceSubmissions(enabled = true) {
  return useQuery({ queryKey: workspaceSubmissionsKey, queryFn: getSubmissions, enabled });
}

export function useWorkspaceResults(enabled = true) {
  return useQuery({ queryKey: workspaceResultsKey, queryFn: getResults, enabled });
}
