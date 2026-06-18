import type { IVidWithCustom } from "@customTypes/types";
import { For, Show } from "solid-js";
import { ChapterButton } from "./ChapterButton";
import { currentBook } from "@lib/store";

interface IChapterList {
  chapterButtonOnClick: (arg: IVidWithCustom) => void;
  currentVid: IVidWithCustom;
  vidIsCompleted: (vid: IVidWithCustom) => boolean;
}
export function ChapterList(props: IChapterList) {
  return (
    <Show when={props.currentVid}>
      <div class="flex flex-col ">
        <p class="text-black ">Choose a chapter</p>
        <ul data-js="chapterButtonTrack" class={`flex flex-col gap-1 max-h-80vh overflow-y-auto`}>
          <For each={currentBook()}>
            {(vid) => {
              return (
                <li>
                  <ChapterButton
                    currentVid={props.currentVid}
                    vid={vid}
                    onClick={(clickedVid) => props.chapterButtonOnClick(clickedVid)}
                    vidIsCompleted={props.vidIsCompleted}
                  />
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </Show>
  );
}
