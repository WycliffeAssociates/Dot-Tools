import { ChapterList } from "@components/PlayerNavigation/ChaptersList";
import type { envPropsForPlayer, IVidWithCustom } from "@customTypes/types";
import { currentVid } from "@lib/store";
import { changePlayerSrc, handleChapters, setNewBook } from "@lib/UI";
import { normalizeBookName } from "@lib/utils";
import { createEffect, createResource, createSignal, For, on, Show, Suspense } from "solid-js";
import webVttPkg from "webvtt-parser";
import { VidPlayer } from "./Player";

const { WebVTTParser, WebVTTSerializer } = webVttPkg;

import { actions } from "astro:actions";

interface IAppWrapperProps {
  vids: Record<string | number | symbol, IVidWithCustom[]>;
  playlist: string | undefined;
  playlistDisplayName: string | undefined;
  initialData: {
    vids: IVidWithCustom[];
    chap: IVidWithCustom;
  };
  playerEnv: envPropsForPlayer;
  finishedMap: Record<string, boolean>;
}
export function AppWrapper(props: IAppWrapperProps) {
  // const [vttText, setVttText] = createResource();

  let parser = new WebVTTParser();
  let serializer = new WebVTTSerializer();
  // let parsed = parser.parse(vttText());
  // let isValid = parsed.errors.length === 0;
  const [isValidVtt, setIsValidVtt] = createSignal(true);
  const [errs, setErrs] = createSignal<string[]>([]);
  const [finishedMap, { refetch: refetchMeta }] = createResource(
    async (_id) => {
      const { data, error } = await actions.getFinishedMap({
        playlist: props.playlist!,
      });
      if (error) {
        console.error(error);
        return {};
      }
      return data;
    },
    {
      initialValue: props.finishedMap,
    },
  );
  const [vttText, { mutate: mutateVttText, refetch }] = createResource(
    () => currentVid.id,
    async (id) => {
      console.log(`fetching resource of ${id}`);
      if (!id) return null;
      const { data, error } = await actions.getVtt({
        id: `${id}.vtt`,
        playlist: props.playlist!,
      });
      console.log(data, error);

      if (error) {
        console.error(error);
        return null;
      } else if (data) {
        const metaMapStatus = finishedMap()?.[currentVid.id!];
        if (metaMapStatus === true) {
          let adjusted = adjustVttFromCustomFields(data.text);
          const didChangeOnLoad = adjusted !== data.text;
          if (didChangeOnLoad) {
            console.log("updating from initial load");
            const { error: updateError } = await actions.updateVtt({
              playlist: props.playlist!,
              id: `${currentVid.id!}.vtt`,
              text: adjusted,
            });
            if (updateError) {
              const errString = `
              VTT Updating Errors
              ${Object.entries(updateError)
                .map(([key, val]) => {
                  return `${key}: ${val}`;
                })
                .join("\n")}`;
              window.alert(errString);
            }
          }
          return {
            ...data,
            text: adjusted,
          };
        }
        return data;
      }
    },
    {
      initialValue: null,
      ssrLoadFrom: "initial",
    },
  );
  const [imgs] = createResource(
    () => currentVid.id,
    async (id) => {
      if (!id) return [];
      // Prefer the OCR producer's winners.json (real timestamps + parsed
      // reference + confidence per cue). Fall back to the generic thumbnail
      // listing for videos produced by the old pipeline.
      const { data: winners, error: winnersError } = await actions.getWinnerThumbs({
        videoId: `${id}`,
      });
      if (winnersError) console.error(winnersError);
      if (winners && winners.length > 0) return winners;

      const { data, error } = await actions.getImgsForId({ prefix: `${id}` });
      if (error) {
        console.error(error);
        return [];
      }
      return data ?? [];
    },
    {
      initialValue: [],
      ssrLoadFrom: "initial",
    },
  );

  const vidIsCompleted = (vid: IVidWithCustom) => {
    const map = finishedMap();
    if (!map) return false;
    const key = vid.id;
    if (!key) return false;
    return (map![key] && map![key] === true) as boolean;
  };
  const wholeBookIsCompleted = (book: IVidWithCustom[]) => {
    return book.every((vid) => vidIsCompleted(vid));
  };

  createEffect(
    on(
      () => vttText(),
      (v) => {
        if (v) {
          handleChapters(currentVid, v.text);
        }
      },
    ),
  );

  function adjustVttFromCustomFields(vttContent: string) {
    const parsed = parser.parse(vttContent);
    let refRegex = /(.+) (.+):(.+)-(.+)/;
    parsed.cues.forEach((cue) => {
      let matches = cue.text.match(refRegex);
      if (!matches) return;
      let [_, book, chapter, start, end] = matches;
      if (!book || !chapter || !start || !end) return;
      let vidCustomBookName = normalizeBookName(
        currentVid.custom_fields.localized_book_name || book,
      );
      let vidCustomChapter = Number(currentVid.custom_fields.chapter) || chapter;
      cue.text = `${vidCustomBookName} ${vidCustomChapter}:${start}-${end}`;
      cue.tree.children[0].value = cue.text;
    });
    return serializer.serialize(parsed.cues);
  }

  // upload raw vtt's to r2 based on bc video id
  // onMount, fetch that vtt from r2. We'll have a custom metadata of done or not done on that r2 object. List all the object in the bucket and stick the r2 path on the vid, but defer actually fetching the vtt until the user clicks on the chapter.
  // on Mount here, hit kv, (if not exists create it w/ complete false), stick in r2.  Edit form, slick submit, update kv, update r2, turn buttons and chapters green as marked complete
  // Need an option to mark uncomplete on form.
  // Just pass in a signal of currentVTT to handleChapters in VidPlayer

  // Todo:
  // Bulk edit book name
  // bulk edit chapter
  // Upload thumbnails to use over against vtt video as well? A public "dot tmp" bucket where pictures are stored and do a
  // // const command = new ListObjectsV2Command({
  //   Bucket: "dot-assets",
  //   Prefix: "tza",
  // });
  // where we use that bc id as the prefix, and then for every item in the bucket, we use it's src as an image for thumbs.
  function editVttText(str: string) {
    mutateVttText((prev) => {
      // Preserve the resolved source so the optimistic update doesn't lose it;
      // "finished" lives in the separate completed.json map, not on the VTT.
      return {
        text: str,
        source: prev?.source ?? ("draft" as const),
      };
    });
    const parsed = parser.parse(str);
    if (parsed.errors.length > 0) {
      setIsValidVtt(false);
      setErrs(parsed.errors.map((err) => err.message));
    } else {
      setIsValidVtt(true);
      handleChapters(currentVid, str);
      setErrs([]);
    }
  }
  const vidIsFinished = (id: string) => {
    const latest = finishedMap.latest;
    return latest?.[id] === true;
  };
  const provideDefaultWebVttContent = () => {
    const vid = currentVid;
    if (vid) {
      return `WEBVTT
      
      

00:14.000 --> 00:24.000
${vid.custom_fields.localized_book_name} ${Number(vid.custom_fields.chapter)}:1-2

00:25.000 --> 00:35.000
${vid.custom_fields.localized_book_name} ${Number(vid.custom_fields.chapter)}:3-4
      `;
    } else {
      return `
      WEBVTT
      

00:1.000 --> 00:02.000
      `;
    }
  };
  return (
    // <Suspense fallback={<div>Loading...</div>}>
    <div class="grid grid-cols-[24vw_46vw_24vw] gap-8 p-2 ">
      <div class="shrink-0">
        <Show when={errs().length}>
          <For each={errs()}>{(err) => <p class="text-red-500">{err}</p>}</For>
        </Show>
        <Suspense>
          <VttEditor
            vtt={vttText.latest?.text || ""}
            finished={vidIsFinished(currentVid.id!)}
            onVttChange={editVttText}
            isValid={isValidVtt()}
            playlist={props.playlist!}
            refetch={refetch}
            refetchMeta={refetchMeta}
            provideDefaultWebVttContent={provideDefaultWebVttContent}
          />
        </Suspense>
      </div>
      <div class="flex flex-col">
        <VidPlayer
          initialData={props.initialData}
          playlist={props.playlist}
          playlistDisplayName={props.playlistDisplayName}
          vids={props.vids}
          playerEnv={props.playerEnv}
          vttText={vttText()?.text || ""}
          thumbs={imgs}
        />
      </div>
      <div class="h-full flex gap-2">
        <ChapterList
          chapterButtonOnClick={(vid: IVidWithCustom) => {
            changePlayerSrc(vid, vttText()?.text);
          }}
          currentVid={currentVid}
          vidIsCompleted={vidIsCompleted}
        />

        <BookNav
          vids={props.vids}
          vttText={vttText()?.text || ""}
          wholeBookIsCompleted={wholeBookIsCompleted}
        />
      </div>
    </div>
    // </Suspense>
  );
}

export function BookNav(props: {
  vids: Record<string | number | symbol, IVidWithCustom[]>;
  vttText: string;
  wholeBookIsCompleted: (book: IVidWithCustom[]) => boolean;
}) {
  return (
    <div data-title="BookNav" class={``}>
      <p class="text-black ">Choose a book</p>
      <div class="">
        <div
          style={{
            position: "absolute",
            inset: "0",
            "pointer-events": "none",
            height: "100%",
          }}
          class=""
        />
        <ul class="max-h-80vh overflow-y-auto gap-2 flex flex-col">
          <For each={Object.entries(props.vids)}>
            {([key, book], idx) => {
              return (
                <li
                  class={`w-full md:py-2 ${
                    currentVid.book == key ? "bg-primary/20" : ""
                  } ${props.wholeBookIsCompleted(book) ? "bg-green-300!" : ""}`}
                >
                  <button
                    onClick={() => {
                      setNewBook(book, props.vttText);
                    }}
                    class={`inline-flex gap-2 items-center hover:(text-surface font-bold underline) p-1 ${
                      currentVid.custom_fields?.book?.toUpperCase() === key.toUpperCase()
                        ? "underline font-bold"
                        : ""
                    }`}
                  >
                    <span class="bg-base text-primary dark:text-primary rounded-full p-4 h-0 w-0 inline-grid place-content-center">
                      {idx() + 1}
                    </span>
                    {normalizeBookName(
                      book.find((b) => !!b.localizedBookName)?.localizedBookName || key,
                    )}
                  </button>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

type VttEditorProps = {
  vtt: string;
  finished: boolean;
  onVttChange: (str: string) => void;
  isValid: boolean;
  playlist: string;
  refetch: () => void;
  refetchMeta: () => void;
  provideDefaultWebVttContent: () => string;
};

export function VttEditor(props: VttEditorProps) {
  let textAreaRef: HTMLTextAreaElement | undefined;

  // Save draft = write the R2 VTT only (no Brightcove publish). Errors surface
  // in the button label.
  const save = async (e: MouseEvent) => {
    const target = e.target as HTMLButtonElement;
    target.innerText = "Saving…";
    const { data, error } = await actions.updateVtt({
      playlist: props.playlist,
      id: `${currentVid.id!}.vtt`,
      text: props.vtt,
    });
    if (error || !data?.ok) {
      const msg = error?.message ?? "save failed";
      console.error(error ?? data);
      target.innerText = `Save failed: ${msg}`;
      return;
    }
    target.innerText = "Saved!";
    setTimeout(() => {
      target.innerText = "Save draft";
    }, 1500);
    props.refetch();
  };

  // Publish = auto-save the current text, then push it to Brightcove (Dynamic
  // Ingest). Brightcove's ingest is async (~30s–2min) after the job is accepted.
  const publish = async (e: MouseEvent) => {
    const target = e.target as HTMLButtonElement;
    target.innerText = "Publishing…";
    const { data, error } = await actions.publishVtt({
      playlist: props.playlist,
      id: `${currentVid.id!}.vtt`,
      text: props.vtt,
    });
    if (error || !data?.ok) {
      const msg = error?.message ?? data?.message ?? "publish failed";
      console.error(error ?? data);
      target.innerText = `Publish failed: ${msg}`;
      return;
    }
    target.innerText = "Published!";
    setTimeout(() => {
      target.innerText = "Publish to Brightcove";
    }, 1500);
  };

  // Mark-finished is independent of Save. It only writes to completed.json.
  const setFinished = async (e: MouseEvent, finished: boolean, label: string) => {
    const target = e.target as HTMLButtonElement;
    target.innerText = "Saving…";
    const { error } = await actions.changeCompletedStatusForVid({
      finished,
      playlist: props.playlist,
      id: `${currentVid.id!}`,
    });
    if (error) {
      console.error(error);
      target.innerText = `Failed: ${error}`;
      return;
    }
    target.innerText = "Saved!";
    setTimeout(() => {
      target.innerText = label;
    }, 1500);
    props.refetchMeta();
  };

  return (
    <div class="h-full">
      <textarea
        value={props.vtt}
        class={`w-full max-h-[65vh] h-full p-4 border-2 border-gray-700 text-sm ${
          props.isValid ? "" : "border-red-500! outline-none"
        } ${props.finished ? "border-green-500 border-2" : ""}`}
        onInput={(e) => props.onVttChange(e.target.value)}
        ref={(el) => (textAreaRef = el)}
      />
      <div class="gap-4 items-stretch grid grid-cols-2 text-sm">
        <button
          class="bg-gray-200 cursor-pointer active:bg-primary/20 p-2 rounded-md hover:bg-primary/30"
          onClick={save}
        >
          Save draft
        </button>
        <button
          class="bg-primary/80 text-white cursor-pointer active:bg-primary/60 p-2 rounded-md hover:bg-primary"
          onClick={publish}
        >
          Publish to Brightcove
        </button>
        <button
          class="bg-gray-200 cursor-pointer active:bg-primary/20 p-2 rounded-md hover:bg-primary/30 "
          onClick={() => {
            const defaultVal = props.provideDefaultWebVttContent();
            if (textAreaRef) {
              textAreaRef.value = defaultVal;
            }
          }}
        >
          Provide Default Values
        </button>
        <button
          class="bg-gray-200 cursor-pointer active:bg-primary/20 p-2 rounded-md block hover:bg-primary/30"
          onClick={(e) => setFinished(e, true, "Mark finished")}
        >
          Mark finished
        </button>
        <button
          class="bg-gray-200 cursor-pointer active:bg-primary/20 p-2 rounded-md block hover:bg-primary/30"
          onClick={(e) => setFinished(e, false, "Mark Not finished")}
        >
          Mark Not finished
        </button>
      </div>
      <p class="mt-4">Current Marked Status: {props.finished ? "Finished" : "Not Finished"} </p>
    </div>
  );
}
