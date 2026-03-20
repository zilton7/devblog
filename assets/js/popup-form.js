(function () {
  const POPUP_COOKIE_NAME = 'hide_scroll_popup';
  const SCROLL_THRESHOLD = 0.25; // Show after 50% scroll

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  function showPopup() {
    const popup = document.getElementById('scroll-popup');
    if (popup) {
      popup.style.display = 'block';
    }
  }

  function hidePopup() {
    const popup = document.getElementById('scroll-popup');
    if (popup) {
      popup.style.display = 'none';
    }
  }

  function handleScroll() {
    if (getCookie(POPUP_COOKIE_NAME)) {
      window.removeEventListener('scroll', handleScroll);
      return;
    }

    const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollTotal > 0) {
      const scrollProgress = window.scrollY / scrollTotal;
      if (scrollProgress >= SCROLL_THRESHOLD) {
        showPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.getElementById('close-popup');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hidePopup();
        setCookie(POPUP_COOKIE_NAME, 'true', 1); // Hide for 30 days
      });
    }

    if (!getCookie(POPUP_COOKIE_NAME)) {
      window.addEventListener('scroll', handleScroll);
    }

    // Handle Substack iframe interaction
    window.addEventListener('blur', function () {
      if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
        // User clicked inside the iframe (most likely the Substack form)
        setCookie(POPUP_COOKIE_NAME, 'true', 30);
      }
    });

    // Listen for messages from Substack (in case they send a success event)
    window.addEventListener('message', function (event) {
      if (event.origin.includes('substack.com')) {
        setCookie(POPUP_COOKIE_NAME, 'true', 30);
      }
    });
  });
})();
