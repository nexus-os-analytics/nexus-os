import { ActionIcon, Badge, createTheme, Loader } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 7,
  defaultRadius: 'md',
  focusRing: 'always',
  fontFamily: 'Segoe UI, Roboto, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  headings: {
    fontFamily: 'Segoe UI, Roboto, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
    sizes: {
      h1: { fontSize: '56px', lineHeight: '1.1', fontWeight: '800' },
      h2: { fontSize: '40px', lineHeight: '1.15', fontWeight: '700' },
      h3: { fontSize: '32px', lineHeight: '1.2', fontWeight: '700' },
    },
  },
  colors: {
    // Gold (brand)
    brand: [
      '#fff9e6',
      '#fff1cc',
      '#ffe3a3',
      '#ffd580',
      '#ffc75e',
      '#f5b947',
      '#dba73e',
      '#c09535',
      '#9c7a2c',
      '#2e2e2e',
    ],
    // Neutral gray scale
    neutral: [
      '#f9f9f9',
      '#f2f2f2',
      '#e6e6e6',
      '#dadada',
      '#cfcfcf',
      '#bdbdbd',
      '#8f8f8f',
      '#6e6e6e',
      '#4a4a4a',
      '#2e2e2e',
    ],
    // Black (ink-like)
    ink: [
      '#f2f2f2',
      '#e6e6e6',
      '#cccccc',
      '#b3b3b3',
      '#999999',
      '#808080',
      '#666666',
      '#4d4d4d',
      '#333333',
      '#1a1a1a',
    ],
  },
  fontSizes: {
    xl: '24px',
    lg: '20px',
    md: '16px',
    sm: '14px',
    xs: '12px',
  },
  spacing: {
    xl: '24px',
  },
  components: {
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        variant: 'subtle',
      },
    }),

    Badge: Badge.extend({
      styles: () => ({
        root: {
          minWidth: '80px',
          textAlign: 'left',
        },
      }),
    }),

    DatePicker: {
      defaultProps: {
        locale: 'pt-br',
      },
    },

    DatePickerInput: {
      defaultProps: {
        locale: 'pt-br',
      },
    },

    DateRangePicker: {
      defaultProps: {
        locale: 'pt-br',
      },
    },

    DateRangePickerInput: {
      defaultProps: {
        locale: 'pt-br',
      },
    },

    Loader: Loader.extend({}),
  },
  other: {
    colors: {
      bling: '#288F4E',
      goldDark: '#A8872A',
      blackSoft: '#2E2E2E',
      grayNeutral: '#6E6E6E',
      grayLight: '#F5F5F5',
      blueTech: '#1E90FF',
    },
  },
});
