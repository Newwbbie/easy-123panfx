// ==UserScript==
// @name         123panfx Ctrl+C 自动回帖并打开链接
// @namespace    https://www.123panfx.com/
// @version      1.2.0
// @description  Ctrl+C 时自动回帖，成功后打开 .alert-success 中的链接
// @match        https://www.123panfx.com/?*
// @grant        GM_openInTab
// ==/UserScript==

(function () {
  'use strict';

  const PENDING_OPEN_KEY = '123panfx_pending_open_after_reply';

  function getSuccessLink() {
    const success = document.querySelector('.alert-success');
    if (!success) {
      return '';
    }

    const link = success.querySelector('a[href]');
    if (link) {
      return link.href;
    }

    const text = success.innerText || '';
    const match = text.match(/https?:\/\/\S+/);
    return match ? match[0] : '';
  }

  function openLink(link) {
    if (typeof GM_openInTab === 'function') {
      GM_openInTab(link, {
        active: true,
        insert: true,
        setParent: true,
      });
      return;
    }

    window.open(link, '_blank', 'noopener,noreferrer');
  }

  function openSuccessLink() {
    const link = getSuccessLink();
    if (!link) {
      return false;
    }

    openLink(link);
    return true;
  }

  function reply() {
    const warning = document.querySelector('.alert-warning');
    if (!warning) {
      return false;
    }

    const input = document.querySelector('.form-control');
    if (!input) {
      return false;
    }

    input.focus();
    input.value = '好人一生平安';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    const replyButton = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a'))
      .find((el) => {
        const text = el.innerText || el.value || '';
        return text.trim() === '回帖';
      });

    if (!replyButton) {
      return false;
    }

    sessionStorage.setItem(PENDING_OPEN_KEY, '1');
    replyButton.click();
    return true;
  }

  window.addEventListener('load', function () {
    if (sessionStorage.getItem(PENDING_OPEN_KEY) !== '1') {
      return;
    }

    if (openSuccessLink()) {
      sessionStorage.removeItem(PENDING_OPEN_KEY);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey || event.key.toLowerCase() !== 'c') {
      return;
    }

    event.preventDefault();

    if (openSuccessLink()) {
      sessionStorage.removeItem(PENDING_OPEN_KEY);
      return;
    }

    reply();
  });
})();
