// /stores/ui/schema.js
export const schema = {
  type: 'object',
  required: [
    'header',
    'footer',
    'leftDrawer',
    'rightDrawer',
    'page',
    'layout',
    'theme',
    'toolbar',
    'animations',
    'behavior',
  ],
  properties: {
    header: {
      type: 'object',
      required: ['show', 'height', 'elevated', 'bordered', 'fixed'],
      properties: {
        show: { type: 'boolean' },
        height: { type: 'string', pattern: '^\\d+(\\.\\d+)?(px|rem|em|vh|%)$' },
        elevated: { type: 'boolean' },
        bordered: { type: 'boolean' },
        fixed: { type: 'boolean' },
      },
    },

    footer: {
      type: 'object',
      required: ['show', 'height', 'elevated', 'bordered', 'fixed'],
      properties: {
        show: { type: 'boolean' },
        height: { type: 'string', pattern: '^\\d+(\\.\\d+)?(px|rem|em|vh|%)$' },
        elevated: { type: 'boolean' },
        bordered: { type: 'boolean' },
        fixed: { type: 'boolean' },
      },
    },

    leftDrawer: {
      type: 'object',
      required: [
        'show',
        'overlay',
        'elevated',
        'bordered',
        'behavior',
        'width',
        'miniWidth',
        'breakpoint',
        'mini',
        'miniToOverlay',
        'showIfAbove',
        'fixed',
        'persistent',
      ],
      properties: {
        show: { type: 'boolean' },
        overlay: { type: 'boolean' },
        elevated: { type: 'boolean' },
        bordered: { type: 'boolean' },
        behavior: { type: 'string', enum: ['desktop', 'mobile', 'responsive'] },
        width: { type: 'number', minimum: 0 },
        miniWidth: { type: 'number', minimum: 0 },
        breakpoint: { type: 'number', minimum: 0 },
        mini: { type: 'boolean' },
        miniToOverlay: { type: 'boolean' },
        showIfAbove: { type: 'boolean' },
        fixed: { type: 'boolean' },
        persistent: { type: 'boolean' },
      },
    },

    rightDrawer: {
      type: 'object',
      required: [
        'show',
        'overlay',
        'elevated',
        'bordered',
        'behavior',
        'width',
        'showIfAbove',
        'fixed',
        'persistent',
      ],
      properties: {
        show: { type: 'boolean' },
        overlay: { type: 'boolean' },
        elevated: { type: 'boolean' },
        bordered: { type: 'boolean' },
        behavior: { type: 'string', enum: ['desktop', 'mobile', 'responsive'] },
        width: { type: 'number', minimum: 0 },
        showIfAbove: { type: 'boolean' },
        fixed: { type: 'boolean' },
        persistent: { type: 'boolean' },
      },
    },

    page: {
      type: 'object',
      required: ['padded', 'paddingSize', 'containerWidth', 'elevated', 'bordered'],
      properties: {
        padded: { type: 'boolean' },
        paddingSize: { type: 'string', enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
        containerWidth: { type: 'string', pattern: '^\\d+(\\.\\d+)?(px|rem|em|vh|%)$' },
        elevated: { type: 'boolean' },
        bordered: { type: 'boolean' },
      },
    },

    layout: {
      type: 'object',
      required: ['view', 'containerized', 'scrollable'],
      properties: {
        view: {
          type: 'string',
          pattern: '^[hHl][HhR][hHr]\\s[LlH][pPr][RrH]\\s[fFl][Ffr][fFr]$',
        },
        containerized: { type: 'boolean' },
        scrollable: { type: 'boolean' },
      },
    },

    theme: {
      type: 'object',
      required: [
        'dark',
        'primary',
        'secondary',
        'accent',
        'positive',
        'negative',
        'info',
        'warning',
        'background',
      ],
      properties: {
        dark: { type: 'boolean' },
        primary: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        secondary: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        accent: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        positive: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        negative: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        info: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        warning: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
        background: { type: 'string', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$' },
      },
    },

    toolbar: {
      type: 'object',
      required: ['dense', 'showTitle', 'showNavButton', 'showSearch', 'flat', 'glossy'],
      properties: {
        dense: { type: 'boolean' },
        showTitle: { type: 'boolean' },
        showNavButton: { type: 'boolean' },
        showSearch: { type: 'boolean' },
        flat: { type: 'boolean' },
        glossy: { type: 'boolean' },
      },
    },

    animations: {
      type: 'object',
      required: ['pageTransition', 'drawerTransition'],
      properties: {
        pageTransition: { type: 'string' },
        drawerTransition: { type: 'string' },
      },
    },

    behavior: {
      type: 'object',
      required: [
        'backToTop',
        'mobileBreakpoint',
        'tabletBreakpoint',
        'stickyHeaders',
        'preserveScroll',
        'ripple',
      ],
      properties: {
        backToTop: { type: 'boolean' },
        mobileBreakpoint: { type: 'number', minimum: 0 },
        tabletBreakpoint: { type: 'number', minimum: 0 },
        stickyHeaders: { type: 'boolean' },
        preserveScroll: { type: 'boolean' },
        ripple: { type: 'boolean' },
      },
    },
  },
}
