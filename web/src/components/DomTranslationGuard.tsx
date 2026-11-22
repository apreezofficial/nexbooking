"use client";

import { useEffect } from "react";

/**
 * Google Translate mutates DOM text nodes into <font> wrappers.
 * When React attempts DOM reconciliation, it calls Node.prototype.removeChild
 * or insertBefore assuming the original node hierarchy. Without this patch,
 * an unhandled NotFoundError ("Failed to execute 'removeChild' on 'Node':
 * The node to be removed is not a child of this node") crashes the entire page.
 */
function patchDomForTranslation() {
  if (typeof window === "undefined" || typeof Node === "undefined" || !Node.prototype) return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return this.appendChild(newNode) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

if (typeof window !== "undefined") {
  patchDomForTranslation();
}

export default function DomTranslationGuard() {
  useEffect(() => {
    patchDomForTranslation();
  }, []);
  return null;
}
