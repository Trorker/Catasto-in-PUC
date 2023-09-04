/*!
 * Minimal theme switcher
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2023 - Licensed under MIT
 */

const themeSwitcher = {
  // Config
  _scheme: "auto",
  menuTarget: "details[role='list']",
  buttonsTarget: "a[data-theme-switcher]",
  switcherTarget: "input[theme-switcher]",
  iconTarget: "a[icon-theme-switcher]",
  buttonAttribute: "data-theme-switcher",
  iconAttribute: "icon-theme-switcher",
  rootAttribute: "data-theme",
  localStorageKey: "picoPreferredColorScheme",

  // Init
  init() {
    this.scheme = this.schemeFromLocalStorage;
    this.upadateSwitchers();
    this.initSwitchers();
  },

  // Get color scheme from local storage
  get schemeFromLocalStorage() {
    if (typeof window.localStorage !== "undefined") {
      if (window.localStorage.getItem(this.localStorageKey) !== null) {
        return window.localStorage.getItem(this.localStorageKey);
      }
    }
    return this._scheme;
  },

  // Preferred color scheme
  get preferredColorScheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  // Init switchers
  initSwitchers() {
    const buttons = document.querySelectorAll(this.buttonsTarget);
    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          // Set scheme
          this.scheme = button.getAttribute(this.buttonAttribute);
          // Close dropdown
          document.querySelector(this.menuTarget).removeAttribute("open");
        },
        false
      );
    });

    const switchers = document.querySelectorAll(this.switcherTarget);
    switchers.forEach((switcher) => {
      switcher.checked = this.scheme == "dark" ? true : false;
      switcher.addEventListener(
        "click",
        (event) => {
          // Set scheme
          this.scheme = switcher.checked ? "dark" : "light";

          this.upadateSwitchers();
        },
        false
      );
    });

    const iconSwitchers = document.querySelectorAll(this.iconTarget);
    iconSwitchers.forEach((switcher) => {
      switcher.children[0].textContent = this.scheme == "dark" ? "light_mode" : "dark_mode";
      switcher.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          // Set scheme
          this.scheme = this.scheme == "dark" ? "light" : "dark";
          switcher.children[0].textContent = this.scheme == "dark" ? "light_mode" : "dark_mode";

          this.upadateIconSwitchers();
        },
        false
      );
    });
  },

  upadateSwitchers() {
    const switchers = document.querySelectorAll(this.switcherTarget);
    switchers.forEach((switcher) => {
      switcher.checked = this.scheme == "dark" ? true : false;
    });
  },

  upadateIconSwitchers() {
    const iconSwitchers = document.querySelectorAll(this.iconTarget);
    iconSwitchers.forEach((switcher) => {
      switcher.children[0].textContent = this.scheme == "dark" ? "light_mode" : "dark_mode";
    });
  },

  // Set scheme
  set scheme(scheme) {
    if (scheme == "auto") {
      this.preferredColorScheme == "dark" ? (this._scheme = "dark") : (this._scheme = "light");
    } else if (scheme == "dark" || scheme == "light") {
      this._scheme = scheme;
    }
    this.upadateSwitchers();
    this.applyScheme();
    this.schemeToLocalStorage();
  },

  // Get scheme
  get scheme() {
    return this._scheme;
  },

  // Apply scheme
  applyScheme() {
    document.querySelector("html").setAttribute(this.rootAttribute, this.scheme);
  },

  // Store scheme to local storage
  schemeToLocalStorage() {
    if (typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(this.localStorageKey, this.scheme);
    }
  },
};

// Init
themeSwitcher.init();  