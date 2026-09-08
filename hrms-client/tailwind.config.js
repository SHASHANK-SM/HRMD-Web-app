/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        borderColor: "#D6D6D6",
        orange: "#FF6600",
      },
      boxShadow: {
        custom: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "3.5rem" }],
      },
    },
  },
  plugins: [],
};
