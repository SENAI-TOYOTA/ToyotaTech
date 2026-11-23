import type { GarageDocument } from "@/types/garage";

export function documentStatusLabel(status: GarageDocument["status"]) {
  return status === "pending" ? "Pendente" : "Disponível";
}

export function canOpenDocument(document: GarageDocument) {
  return document.status === "available" && Boolean(document.url);
}
