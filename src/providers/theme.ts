import {
  ActionIcon,
  Badge,
  createTheme,
  Loader,
  Input,
  TextInput,
  Select,
  NumberInput,
  PasswordInput,
  Textarea,
} from '@mantine/core';

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
    // Alert colors - Dead Stock (Capital Parado)
    deadStock: [
      '#FEF3C7',
      '#FEE6A0',
      '#FDD97B',
      '#FCCC54',
      '#FABF2D',
      '#F5B12C',
      '#E89B23',
      '#D58319',
      '#BC680D',
      '#92400E',
    ],
    // Alert colors - Liquidation
    liquidation: [
      '#FFEDD5',
      '#FDD8B8',
      '#FDC29A',
      '#FCA76B',
      '#FB8C3B',
      '#F97316',
      '#EB6F0D',
      '#D85F0A',
      '#B94908',
      '#9A3412',
    ],
    // Alert colors - Opportunity (Verde)
    opportunity: [
      '#D1FAE5',
      '#A7F3D0',
      '#6EE7B7',
      '#34D399',
      '#10B981',
      '#059669',
      '#047857',
      '#065F46',
      '#064E3B',
      '#022C1D',
    ],
    // Alert colors - Fine/Healthy (Cinza Neutro)
    fine: [
      '#F3F4F6',
      '#E5E7EB',
      '#D1D5DB',
      '#9CA3AF',
      '#6B7280',
      '#4B5563',
      '#374151',
      '#1F2937',
      '#111827',
      '#030712',
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
    // Prevent zoom on mobile devices by enforcing strict font-size rules
    Input: Input.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),
    TextInput: TextInput.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),
    Select: Select.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),
    PasswordInput: PasswordInput.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),
    NumberInput: NumberInput.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),
    Textarea: Textarea.extend({
      styles: {
        input: {
          fontSize: '16px',
        },
      },
    }),

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
