import type { Accessor } from "solid-js";

interface ISeekBarChapterText {
  text: Accessor<string>;
}
export function SeekBarChapterText(props: ISeekBarChapterText) {
  return (
    // <Show when={props.text}>
    <span data-role="chapLabelTextHolder" class="chapLabelTextHolder">
      {props.text()}
    </span>
    // </Show>
  );
}
