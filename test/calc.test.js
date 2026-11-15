const test = require("node:test");
const assert = require("node:assert/strict");
const H = require("../calc.js");

const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≈ ${b}`);

test("end of service: 3 years, terminated → half month per year", () => {
  const r = H.endOfService(10000, 3, "term");
  close(r.first5, 15000); close(r.after5, 0); close(r.payout, 15000); assert.equal(r.ratio, 1);
});

test("end of service: 8 years → 5 × half month + 3 × full month", () => {
  const r = H.endOfService(10000, 8, "expire");
  close(r.first5, 25000); close(r.after5, 30000); close(r.payout, 55000);
});

test("Article 85 resignation tiers", () => {
  assert.equal(H.endOfService(10000, 1.9, "resign").payout, 0);
  close(H.endOfService(10000, 3, "resign").payout, 15000 / 3);
  close(H.endOfService(10000, 7, "resign").payout, (25000 + 20000) * 2 / 3);
  close(H.endOfService(10000, 12, "resign").payout, 25000 + 70000);
});

test("tier boundaries: exactly 2, 5 and 10 years", () => {
  assert.equal(H.endOfService(9000, 2, "resign").ratio, 1 / 3);
  assert.equal(H.endOfService(9000, 5, "resign").ratio, 2 / 3);
  assert.equal(H.endOfService(9000, 10, "resign").ratio, 1);
});

test("resignation exceptions get the full award", () => {
  assert.equal(H.endOfService(8000, 1, "resign", { femaleCase: true }).ratio, 1);
  assert.equal(H.endOfService(8000, 1, "resign", { fixedContract: true }).ratio, 1);
});

test("duration in years / months / days", () => {
  assert.deepEqual(H.durationYMD(new Date(2020, 0, 15), new Date(2023, 4, 20)), { y: 3, m: 4, d: 5 });
  assert.deepEqual(H.durationYMD(new Date(2020, 0, 31), new Date(2020, 2, 1)), { y: 0, m: 1, d: 1 });
  close(H.serviceYears(new Date(2020, 0, 1), new Date(2025, 0, 1)), 5);
});

test("annual leave: daily wage × days, entitlement by tenure", () => {
  const r = H.annualLeave(9000, 15);
  close(r.daily, 300); close(r.total, 4500);
  assert.equal(H.leaveEntitlement(4.9), 21);
  assert.equal(H.leaveEntitlement(5), 30);
});

test("overtime: 150% of hourly wage", () => {
  const r = H.overtime(8000, 10, 8);
  close(r.hourly, 33.333); close(r.otRate, 50); close(r.total, 500);
});

test("notice period: 60 days employer, 30 days worker, 30 for non-monthly wage", () => {
  assert.equal(H.noticeDays("employer", "monthly"), 60);
  assert.equal(H.noticeDays("worker", "monthly"), 30);
  assert.equal(H.noticeDays("employer", "other"), 30);
  close(H.noticePay(6000, "employer", "monthly").total, 12000);
});
