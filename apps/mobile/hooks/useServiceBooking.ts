import { useSyncExternalStore } from "react";

export interface ServiceBooking {
  id: string;
  dealershipId: string;
  dealershipName: string;
  serviceType: string;
  date: string;
  time: string;
  notes?: string;
}

let bookings: ServiceBooking[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return bookings;
}

export function addBooking(booking: Omit<ServiceBooking, "id">) {
  const created = { ...booking, id: `bk-${Date.now()}` };
  bookings = [created, ...bookings];
  listeners.forEach((listener) => listener());
  return created;
}

export function cancelBooking(id: string) {
  bookings = bookings.filter((booking) => booking.id !== id);
  listeners.forEach((listener) => listener());
}

export function useServiceBookings() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
