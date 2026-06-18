import type { IVidWithCustom } from "@customTypes/types";

interface IChapterButton {
  onClick: (vid: IVidWithCustom) => void;
  vid: IVidWithCustom;
  currentVid: IVidWithCustom;
  vidIsCompleted: (vid: IVidWithCustom) => boolean;
}
export function ChapterButton(props: IChapterButton) {
  return (
    <button
      onClick={() => {
        props.onClick(props.vid);
      }}
      class={`bg-gray-200 w-full cursor pointer p-1 hover:bg-primary/20 ${
        props.currentVid.chapter == props.vid.chapter ? "bg-primary/20" : ""
      } ${props.vidIsCompleted(props.vid) ? "bg-green-300!" : ""}`}
    >
      {Number(props.vid.chapter)}
    </button>
  );
}
