// uno.config.ts
import { defineConfig, presetWind3, transformerVariantGroup } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";

export default defineConfig({
  theme: {
    fontFamily: {
      sans: "Montserrat",
    },
    colors: {
      surface: "hsl(var(--clrSurface))",
      base: "hsl(var(--clrBase))",
      primary: "hsl(var(--clrPrimary))",
      secondary: "hsl(var(--clrSecondary))",
      tertiary: "hsl(var(--clrTertiary))",
    },
  },
  presets: [presetWind3()],
  transformers: [transformerVariantGroup(), transformerDirectives({})],
  rules: [
    [
      /^grid-col-fill-(\d+)$/,
      ([, d]) => ({
        "grid-template-columns": `repeat( auto-fit, minmax(${d}px, 1fr) );`,
      }),
    ],
    [
      /^scrollbar-hide$/,
      ([_]) => {
        return `.scrollbar-hide{scrollbar-width:none}
.scrollbar-hide::-webkit-scrollbar{display:none}`;
      },
    ],
    [
      /^scrollbar-default$/,
      ([_]) => {
        return `.scrollbar-default{scrollbar-width:auto}
.scrollbar-default::-webkit-scrollbar{display:block}`;
      },
    ],
    [
      // https://unocss.dev/config/theme#usage-in-rules
      /^text-(.*)$/,
      // @ts-ignore
      ([, c], { theme }) => {
        if (theme.colors && theme.colors[c]) return { color: theme.colors[c] };
      },
    ],
    // [
    //   /^fill-(.*)$/,
    //   // @ts-ignore
    //   ([, c], {theme}) => {
    //     if (theme.colors && theme.colors[c]) return {fill: theme.colors[c]};
    //   },
    // ],
    // [
    //   /^stroke-(.*)$/,
    //   // @ts-ignore
    //   ([, c], {theme}) => {
    //     if (theme.colors && theme.colors[c]) return {stroke: theme.colors[c]};
    //   },
    // ],
    [
      // https://unocss.dev/config/theme#usage-in-rules
      /^bglg-(.*(?=\)$))/,
      ([, c]) => {
        return {
          "background-image": `linear-gradient(${c.replaceAll("_", " ")})`,
        };
      },
    ],
    [
      // https://unocss.dev/config/theme#usage-in-rules
      /^bg-(.*)$/,
      // @ts-ignore
      ([, c], { theme }) => {
        if (theme.colors && theme.colors[c]) {
          return { "background-color": theme.colors[c] };
        }
      },
    ],
  ],
});
