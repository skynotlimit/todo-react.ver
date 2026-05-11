import { describe, it, expect } from "vitest";
import type { Routine } from "@prisma/client";
import { isRoutineDueOn } from "./routines";

// Prisma의 Routine 타입은 필드가 많아서, 테스트마다 직접 만들면 노이즈가 큽니다.
// 기본값을 다 채운 helper로 한 번 만들고, 테스트마다 필요한 필드만 덮어씁니다.
function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: "r1",
    userId: "u1",
    title: "test",
    notes: null,
    priority: "MEDIUM",
    freq: "DAILY",
    byWeekday: 127, // 모든 요일 (0b1111111)
    byMonthDay: null,
    timeOfDay: null,
    remindBefore: null,
    startDate: new Date("2026-01-01"),
    endDate: null,
    active: true,
    categoryId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("isRoutineDueOn", () => {
  describe("active 플래그", () => {
    it("active=false면 어떤 날짜에도 false", () => {
      const r = makeRoutine({ active: false });
      expect(isRoutineDueOn(r, new Date("2026-06-01"))).toBe(false);
    });
  });

  describe("날짜 범위 (startDate / endDate)", () => {
    it("startDate 이전이면 false", () => {
      const r = makeRoutine({ startDate: new Date("2026-06-01") });
      expect(isRoutineDueOn(r, new Date("2026-05-31"))).toBe(false);
    });

    it("startDate 당일이면 true (DAILY)", () => {
      const r = makeRoutine({ startDate: new Date("2026-06-01") });
      expect(isRoutineDueOn(r, new Date("2026-06-01"))).toBe(true);
    });

    it("endDate 이후면 false", () => {
      const r = makeRoutine({
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-30"),
      });
      expect(isRoutineDueOn(r, new Date("2026-07-01"))).toBe(false);
    });

    it("endDate 당일이면 true (DAILY)", () => {
      const r = makeRoutine({
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-30"),
      });
      expect(isRoutineDueOn(r, new Date("2026-06-30"))).toBe(true);
    });
  });

  describe("DAILY", () => {
    it("범위 안이면 요일 무관 항상 true", () => {
      const r = makeRoutine({ freq: "DAILY" });
      // 2026-05-11 = 월, 12 = 화, 17 = 일
      expect(isRoutineDueOn(r, new Date("2026-05-11"))).toBe(true);
      expect(isRoutineDueOn(r, new Date("2026-05-12"))).toBe(true);
      expect(isRoutineDueOn(r, new Date("2026-05-17"))).toBe(true);
    });
  });

  describe("WEEKLY (byWeekday 비트마스크)", () => {
    // 비트 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
    it("byWeekday=1 (월요일만)이면 월요일에만 true", () => {
      const r = makeRoutine({ freq: "WEEKLY", byWeekday: 0b0000001 });
      expect(isRoutineDueOn(r, new Date("2026-05-11"))).toBe(true);  // 월
      expect(isRoutineDueOn(r, new Date("2026-05-12"))).toBe(false); // 화
      expect(isRoutineDueOn(r, new Date("2026-05-17"))).toBe(false); // 일
    });

    it("byWeekday=64 (일요일만)이면 일요일에만 true", () => {
      const r = makeRoutine({ freq: "WEEKLY", byWeekday: 0b1000000 });
      expect(isRoutineDueOn(r, new Date("2026-05-11"))).toBe(false); // 월
      expect(isRoutineDueOn(r, new Date("2026-05-17"))).toBe(true);  // 일
    });

    it("byWeekday=31 (월~금)이면 평일만 true", () => {
      const r = makeRoutine({ freq: "WEEKLY", byWeekday: 0b0011111 });
      expect(isRoutineDueOn(r, new Date("2026-05-11"))).toBe(true);  // 월
      expect(isRoutineDueOn(r, new Date("2026-05-15"))).toBe(true);  // 금
      expect(isRoutineDueOn(r, new Date("2026-05-16"))).toBe(false); // 토
      expect(isRoutineDueOn(r, new Date("2026-05-17"))).toBe(false); // 일
    });
  });

  describe("MONTHLY", () => {
    it("byMonthDay=15면 매달 15일에만 true", () => {
      const r = makeRoutine({ freq: "MONTHLY", byMonthDay: 15 });
      expect(isRoutineDueOn(r, new Date("2026-05-15"))).toBe(true);
      expect(isRoutineDueOn(r, new Date("2026-06-15"))).toBe(true);
      expect(isRoutineDueOn(r, new Date("2026-05-14"))).toBe(false);
    });

    it("byMonthDay=null이면 startDate의 일자를 사용", () => {
      const r = makeRoutine({
        freq: "MONTHLY",
        byMonthDay: null,
        startDate: new Date("2026-01-07"),
      });
      expect(isRoutineDueOn(r, new Date("2026-05-07"))).toBe(true);
      expect(isRoutineDueOn(r, new Date("2026-05-08"))).toBe(false);
    });
  });
});
