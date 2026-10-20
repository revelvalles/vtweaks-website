import { pageHead } from "./metadata";

// Remove the draft indexing restriction only after the owner's legal review.
export function legalPageHead(title: string, description: string) {
  const head = pageHead(title, description);
  return { ...head, meta: [...head.meta, { name: "robots", content: "noindex, follow" }] };
}
