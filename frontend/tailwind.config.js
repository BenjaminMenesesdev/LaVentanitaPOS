/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#EAF6FB",
        surface: "#FFFFFF",
        muted: "#E0F2FC",
        border: "#C6DEF6",
        primary: {
          DEFAULT: "#5080BE",
          dark: "#3D6494",
          light: "#7EBBDA",
        },
        secondary: "#7EBBDA",
        ink: "#16232F",
        inkmuted: "#5C7085",
        warn: "#B5651D",
        warnbg: "#FBEEE0",
        danger: "#B33A3A",
        dangerbg: "#FBEAEA",
        ok: "#2F7A4D",
        okbg: "#E9F5EE",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
