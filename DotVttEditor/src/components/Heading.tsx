import type { JSX } from "solid-js";
import { splitProps } from "solid-js";

function headingClass(level: number) {
  switch (level) {
    case 1:
      return "text-3xl";
    case 2:
      return "text-2xl";
    case 3:
      return "text-xl";
    default:
      return "";
  }
}

interface HeadingProps2 extends JSX.HTMLAttributes<HTMLHeadingElement> {
  classes?: string;
}

const H1 = (props: HeadingProps2) => {
  const [local, rest] = splitProps(props, ["classes"]);
  return (
    <h1 class={` ${headingClass(1)} ${local.classes}`} {...rest}>
      {props.children}
    </h1>
  );
};
const H2 = (props: HeadingProps2) => {
  const [local, rest] = splitProps(props, ["classes"]);

  return (
    <h1 class={` ${headingClass(2)} ${local.classes}`} {...rest}>
      {props.children}
    </h1>
  );
};
const H3 = (props: HeadingProps2) => {
  const [local, rest] = splitProps(props, ["classes"]);

  return (
    <h1 class={` ${headingClass(3)} ${local.classes}`} {...rest}>
      {props.children}
    </h1>
  );
};
const H4 = (props: HeadingProps2) => {
  const [local, rest] = splitProps(props, ["classes"]);

  return (
    <h1 class={` ${headingClass(4)} ${local.classes}`} {...rest}>
      {props.children}
    </h1>
  );
};

export { H1, H2, H3, H4 };
