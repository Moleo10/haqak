/* ===== حقّك: منطق الحساب (دوال نقية بدون DOM) =====
 * Pure calculation functions shared by the pages and the unit tests.
 * Works in the browser (window.Haqak) and in Node (module.exports).
 */
(function (root) {
  const DAYS_PER_MONTH = 30; // نظام العمل يحسب أجر اليوم على أساس ٣٠ يومًا

  /** الفرق بين تاريخين بالسنوات والأشهر والأيام */
  function durationYMD(start, end) {
    // Add whole months to the start date (clamping to the month's last day, e.g. 31 Jan + 1 month = 29 Feb),
    // then count the remaining days. This avoids negative day counts at month ends.
    const addMonths = (date, n) => {
      const y = date.getFullYear(), mo = date.getMonth() + n;
      const last = new Date(y, mo + 1, 0).getDate();
      return new Date(y, mo, Math.min(date.getDate(), last));
    };
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (addMonths(start, months) > end) months--;
    const anchor = addMonths(start, months);
    const d = Math.round((end - anchor) / 86400000);
    return { y: Math.floor(months / 12), m: months % 12, d };
  }

  /** مدة الخدمة بالسنوات (عشرية) */
  function serviceYears(start, end) {
    return (end - start) / (1000 * 60 * 60 * 24 * 365.25);
  }

  /**
   * مكافأة نهاية الخدمة (المادتان ٨٤ و٨٥)
   * @param {number} salary  آخر راتب شهري (أساسي + بدلات ثابتة)
   * @param {number} years   مدة الخدمة بالسنوات
   * @param {"term"|"expire"|"resign"} reason
   * @param {{fixedContract?:boolean, femaleCase?:boolean}} opts
   */
  function endOfService(salary, years, reason, opts = {}) {
    const first5 = Math.min(years, 5) * (salary / 2);         // نصف شهر عن كل سنة من أول ٥
    const after5 = Math.max(years - 5, 0) * salary;           // شهر كامل عن كل سنة بعدها
    const full = first5 + after5;

    let ratio = 1;
    let rule = reason === "term" ? "termination" : reason === "expire" ? "expiry" : "resign";
    if (reason === "resign") {
      if (opts.femaleCase) { ratio = 1; rule = "female"; }
      else if (opts.fixedContract) { ratio = 1; rule = "fixed"; }
      else if (years < 2) ratio = 0;
      else if (years < 5) ratio = 1 / 3;
      else if (years < 10) ratio = 2 / 3;
      else ratio = 1;
    }
    return { first5, after5, full, ratio, payout: full * ratio, rule };
  }

  /** بدل الإجازة السنوية (المادة ١٠٩): أجر اليوم × الأيام */
  function annualLeave(salary, days) {
    const daily = salary / DAYS_PER_MONTH;
    return { daily, total: daily * days };
  }

  /** الاستحقاق السنوي للإجازة حسب مدة الخدمة */
  function leaveEntitlement(years) {
    return years >= 5 ? 30 : 21;
  }

  /** أجر العمل الإضافي (المادة ١٠٧): أجر الساعة × ١٫٥ */
  function overtime(salary, hours, dailyHours = 8) {
    const hourly = salary / (DAYS_PER_MONTH * dailyHours);
    const otRate = hourly * 1.5;
    return { hourly, otRate, total: otRate * hours };
  }

  /** مدة الإشعار النظامية (المادة ٧٥) */
  function noticeDays(party, wage) {
    if (wage === "other") return 30;
    return party === "employer" ? 60 : 30;
  }

  /** بدل مهلة الإشعار */
  function noticePay(salary, party, wage) {
    const days = noticeDays(party, wage);
    const daily = salary / DAYS_PER_MONTH;
    return { days, daily, total: daily * days };
  }

  const api = { durationYMD, serviceYears, endOfService, annualLeave, leaveEntitlement, overtime, noticeDays, noticePay };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Haqak = api;
})(typeof window !== "undefined" ? window : globalThis);
