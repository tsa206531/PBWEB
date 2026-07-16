/* PromptBox 官網共用腳本
   主題切換 / OS 偵測下載 / 捲動 fade-in / 行動版選單 / Use-Case tabs / Docs scroll-spy */
(function () {
  "use strict";

  var RELEASES_URL = "https://github.com/tsa206531/PromptBox/releases";

  /* ---------- 主題切換（初始 class 由 <head> inline script 先掛，避免 FOUC） ---------- */
  var themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem("pb-theme", isDark ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- 行動版選單 ---------- */
  var burger = document.querySelector(".nav-burger");
  var navLinks = document.querySelector(".nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  /* ---------- OS 偵測：把下載 CTA 換成訪客的作業系統 ---------- */
  function detectOS() {
    var ua = navigator.userAgent;
    if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
    if (/Windows/i.test(ua)) return "win";
    return "other";
  }
  var os = detectOS();
  document.querySelectorAll("[data-os-cta]").forEach(function (btn) {
    var label = btn.querySelector("[data-os-label]");
    if (!label) return;
    if (os === "mac") label.textContent = "免費下載 macOS 版";
    else if (os === "win") label.textContent = "免費下載 Windows 版";
    else label.textContent = "免費下載";
    btn.setAttribute("href", RELEASES_URL);
  });
  document.querySelectorAll("[data-os-note]").forEach(function (el) {
    el.textContent =
      os === "mac" ? "適用 macOS 10.15+ ・ 也提供 Windows 版" :
      os === "win" ? "適用 Windows 10 / 11 ・ 也提供 macOS 版" :
      "支援 Windows 10/11 與 macOS 10.15+";
  });
  /* 下載頁：高亮訪客 OS 的平台卡 */
  var osCard = document.querySelector('[data-platform="' + os + '"]');
  if (osCard) osCard.classList.add("recommended");

  /* ---------- 捲動 fade-in（prefers-reduced-motion 時 CSS 已直接顯示） ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Use-Case tabs（首頁） ---------- */
  var tabBtns = document.querySelectorAll(".tab-btn");
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabBtns.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ---------- Docs scroll-spy：高亮側欄當前章節 ---------- */
  var docsSections = document.querySelectorAll(".docs-content section[id]");
  var docsNavLinks = document.querySelectorAll(".docs-sidebar nav a[href^='#']");
  if (docsSections.length && docsNavLinks.length && "IntersectionObserver" in window) {
    var linkMap = {};
    docsNavLinks.forEach(function (a) { linkMap[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          docsNavLinks.forEach(function (a) { a.classList.remove("active"); });
          var link = linkMap[entry.target.id];
          if (link) link.classList.add("active");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    docsSections.forEach(function (s) { spy.observe(s); });
  }
})();
