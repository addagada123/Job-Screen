import { extendTheme } from "@chakra-ui/theme-utils";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "#0a0a0f",
        color: "#e2e8f0",
      },
      "::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
      },
      "::-webkit-scrollbar-track": {
        bg: "#0a0a0f",
      },
      "::-webkit-scrollbar-thumb": {
        bg: "linear-gradient(180deg, #6366f1, #8b5cf6)",
        borderRadius: "4px",
      },
    },
  },
  colors: {
    brand: {
      50: "#f0f0ff",
      100: "#c7c6ff",
      200: "#a5a4ff",
      300: "#8183ff",
      400: "#6366f1",
      500: "#4f46e5",
      600: "#4338ca",
      700: "#3730a3",
      800: "#312e81",
      900: "#1e1b4b",
    },
    accent: {
      cyan: "#22d3ee",
      violet: "#8b5cf6",
      rose: "#f43f5e",
      emerald: "#10b981",
      amber: "#f59e0b",
    },
    surface: {
      glass: "rgba(255, 255, 255, 0.05)",
      glassHover: "rgba(255, 255, 255, 0.1)",
      border: "rgba(255, 255, 255, 0.08)",
      borderHover: "rgba(255, 255, 255, 0.15)",
    },
  },
  fonts: {
    heading: "'Space Grotesk', 'Outfit', sans-serif",
    body: "'Inter', 'Outfit', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "xl",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      variants: {
        solid: {
          bg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          _hover: {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 40px -10px rgba(99, 102, 241, 0.5)",
            _disabled: {
              transform: "none",
              boxShadow: "none",
            },
          },
          _active: {
            transform: "translateY(0)",
          },
        },
        ghost: {
          color: "gray.300",
          _hover: {
            bg: "surface.glassHover",
            color: "white",
          },
        },
        outline: {
          borderColor: "surface.border",
          color: "gray.300",
          _hover: {
            bg: "surface.glassHover",
            borderColor: "brand.400",
            color: "white",
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: "surface.glass",
            borderColor: "surface.border",
            borderWidth: "1px",
            _hover: {
              bg: "surface.glassHover",
              borderColor: "surface.borderHover",
            },
            _focus: {
              bg: "surface.glassHover",
              borderColor: "brand.400",
              boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
            },
            _placeholder: {
              color: "gray.500",
            },
          },
        },
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "surface.glass",
          backdropFilter: "blur(20px)",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "surface.border",
        },
      },
    },
  },
  shadows: {
    glow: "0 0 40px rgba(99, 102, 241, 0.3)",
    glowCyan: "0 0 40px rgba(34, 211, 238, 0.3)",
    glowViolet: "0 0 40px rgba(139, 92, 246, 0.3)",
  },
  radii: {
    card: "24px",
  },
});

export default theme;

