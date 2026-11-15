/* ===== أدوات مشتركة ===== */
// تنسيق رقم مع فواصل وتحويله لأرقام عربية
window.fmt = function(n){
  const r = Math.round(n).toLocaleString("en-US");
  return r.replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]).replace(/,/g, "٬"); // فاصل الآلاف العربي
};
// تحويل أي أرقام لاتينية إلى عربية
window.ar = function(s){
  return String(s).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
};

// قائمة الجوال
document.addEventListener("DOMContentLoaded", function(){
  const t = document.querySelector(".nav-toggle");
  const l = document.querySelector(".nav-links");
  if(t && l){
    t.addEventListener("click", () => {
      const open = l.classList.toggle("open");
      t.setAttribute("aria-expanded", open);
    });
  }
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});
