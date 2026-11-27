export function recallStatusLabel(status?: string) {
  return status === "completed" ? "Concluída" : "Aberta";
}

export function isRecallCompleted(status?: string) {
  return status === "completed";
}
