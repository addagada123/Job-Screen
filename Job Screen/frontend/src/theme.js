import { extendTheme } from "@chakra-ui/theme-utils";
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#0f1218",
        color: "#fff",
      },
    },
  },
  colors: {
    brand: {
      100: "#00d4ff",
      200: "#10b981",
      900: "#1a1f2e",
    },
  },
  fonts: {
    heading: "'Rajdhani', sans-serif",
    body: "'Exo 2', sans-serif",
  },
});

export default theme;
