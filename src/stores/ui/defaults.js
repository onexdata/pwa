// stores/ui/defaults.js
export const defaults = {
  // Header configuration
  header: {
    show: true,
    height: '164px',
    elevated: false,
    bordered: false,
    fixed: true,
  },

  // Footer configuration
  footer: {
    show: true,
    height: '48px',
    elevated: false,
    bordered: true,
    fixed: false,
  },

  // Left drawer configuration
  leftDrawer: {
    show: true,
    overlay: false,
    elevated: true,
    bordered: false,
    behavior: 'desktop', // 'desktop', 'mobile', 'responsive'
    width: 256,
    miniWidth: 60,
    breakpoint: 1023,
    mini: false,
    miniToOverlay: true,
    showIfAbove: true,
    fixed: true,
    persistent: false,
  },

  // Right drawer configuration
  rightDrawer: {
    show: false,
    overlay: true,
    elevated: true,
    bordered: false,
    behavior: 'mobile', // 'desktop', 'mobile', 'responsive'
    width: 300,
    showIfAbove: false,
    fixed: true,
    persistent: false,
  },

  // Page configuration
  page: {
    padded: true,
    paddingSize: 'md', // xs, sm, md, lg, xl
    containerWidth: '1200px',
    elevated: false,
    bordered: false,
  },

  // Layout configuration
  layout: {
    view: 'hHh LpR fFf', // Quasar view string
    containerized: false,
    scrollable: true,
  },

  // Theme configuration
  theme: {
    dark: false,
    primary: '#1976D2',
    secondary: '#26A69A',
    accent: '#9C27B0',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037',
    background: '#f5f5f5',
  },

  // Global toolbar/menu configuration
  toolbar: {
    dense: false,
    showTitle: true,
    showNavButton: true,
    showSearch: true,
    flat: false,
    glossy: true,
  },

  // Animation settings
  animations: {
    pageTransition: 'fade',
    drawerTransition: 'slide-right',
  },

  // App-wide behavior settings
  behavior: {
    backToTop: true,
    mobileBreakpoint: 600,
    tabletBreakpoint: 1024,
    stickyHeaders: true,
    preserveScroll: true,
    ripple: true,
  },
}
