import { useState } from "react";
import { Task } from "../types/Task";

export const useTasks = () => {
  const [tasks] = useState<Task[]>([
    { id: 1, groupId: 1, title: "Zakończyć raport", priority: 1, description: "Raport kwartalny dla zarządu", date: new Date("2025-03-25T10:00:00"), category: "Dokumenty", isCompleted: false },
    { id: 2, groupId: 1, title: "Spotkanie zespołu", priority: 2, description: "Omówienie projektu", date: new Date("2025-03-26T14:00:00"), category: "Spotkania", isCompleted: false },
    { id: 3, groupId: 2, title: "Zakupy na weekend", priority: 3, description: "Lista zakupów na sobotę", date: new Date("2025-03-27T16:00:00"), category: "Zakupy", isCompleted: false },
    { id: 4, groupId: 2, title: "Zadzwonić do mamy", priority: 1, description: "Sprawdzić, jak się czuje", date: new Date("2025-03-25T18:00:00"), category: "Rodzina", isCompleted: false },
    { id: 5, groupId: 3, title: "Rezerwacja restauracji", priority: 2, description: "Kolacja ze znajomymi", date: new Date("2025-03-28T20:00:00"), category: "Rozrywka", isCompleted: false },
    { id: 6, groupId: 3, title: "Organizacja imprezy", priority: 1, description: "Zaprosić gości", date: new Date("2025-03-29T19:00:00"), category: "Znajomi", isCompleted: false },
    { id: 7, groupId: 4, title: "Siłownia", priority: 3, description: "Trening siłowy", date: new Date("2025-03-24T07:00:00"), category: "Sport", isCompleted: true },
    { id: 8, groupId: 4, title: "Bieganie", priority: 2, description: "5 km w parku", date: new Date("2025-03-26T08:00:00"), category: "Sport", isCompleted: false },
    { id: 9, groupId: 1, title: "Przygotowanie prezentacji", priority: 1, description: "Prezentacja dla klientów", date: new Date("2025-03-27T09:00:00"), category: "Praca", isCompleted: false },
    { id: 10, groupId: 2, title: "Planowanie wakacji", priority: 3, description: "Sprawdzenie lotów", date: new Date("2025-03-30T12:00:00"), category: "Rodzina", isCompleted: false },
    { id: 11, groupId: 3, title: "Nowy serial", priority: 3, description: "Obejrzeć nowy odcinek", date: new Date("2025-03-26T21:00:00"), category: "Rozrywka", isCompleted: true },
    { id: 12, groupId: 4, title: "Mecz piłki nożnej", priority: 2, description: "Sparing z drużyną", date: new Date("2025-04-01T17:00:00"), category: "Sport", isCompleted: false },
    { id: 13, groupId: 1, title: "Napisanie raportu", priority: 1, description: "Podsumowanie wyników kwartalnych", date: new Date("2025-03-27T11:00:00"), category: "Praca", isCompleted: false },
    { id: 14, groupId: 2, title: "Sprzątanie mieszkania", priority: 3, description: "Odkurzyć i umyć podłogi", date: new Date("2025-03-26T13:00:00"), category: "Dom", isCompleted: false },
    { id: 15, groupId: 3, title: "Zakupy spożywcze", priority: 2, description: "Uzupełnić zapasy", date: new Date("2025-03-27T15:00:00"), category: "Zakupy", isCompleted: false },
    { id: 16, groupId: 4, title: "Trening na basenie", priority: 2, description: "Pływanie 30 minut", date: new Date("2025-03-28T06:30:00"), category: "Sport", isCompleted: false },
    { id: 17, groupId: 1, title: "Rozmowa kwalifikacyjna", priority: 1, description: "Spotkanie rekrutacyjne", date: new Date("2025-03-29T10:30:00"), category: "Praca", isCompleted: false },
    { id: 18, groupId: 2, title: "Odwiedzić dziadków", priority: 1, description: "Pojechać na wizytę", date: new Date("2025-03-30T14:00:00"), category: "Rodzina", isCompleted: false },
    { id: 19, groupId: 3, title: "Kino z przyjaciółmi", priority: 3, description: "Nowy film akcji", date: new Date("2025-03-31T19:30:00"), category: "Rozrywka", isCompleted: false },
    { id: 20, groupId: 4, title: "Joga", priority: 3, description: "Relaks i medytacja", date: new Date("2025-03-25T08:00:00"), category: "Sport", isCompleted: false },
  ]);

  return tasks;
};