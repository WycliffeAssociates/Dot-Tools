import type { IVidWithCustom, envPropsForPlayer } from "@customTypes/types";
import { For, Show, Suspense, createSignal, onMount, type InitializedResource } from "solid-js";
import {
  mobileHorizontalPadding,
  CONTAINER,
  debounce,
  playerCustomHotKeys,
  jumpToNextChap,
  handleProgressBarHover,
  handlePlayRateChange,
  handleChapters,
  getAdjacentChap,
  trackAdjacentChap,
  handleVideoJsTaps,
} from "@lib/UI";
import {
  currentVid,
  setCurrentVid,
  setCurrentBook,
  currentChapLabel,
  vjsPlayer,
  setVjsPlayer,
  playerSpeed,
  setPlayerSpeed,
  setCurrentPlaylist,
} from "@lib/store";
import {
  IconChapBack,
  IconChapNext,
  IconExternalLink,
  LoadingSpinner,
  SpeedIcon,
} from "@components/Icons";

import { SeekBarChapterText } from "@components/Player/SeekBarText";
import { PLAYER_LOADER_OPTIONS } from "src/constants";

import { normalizeBookName, secondsToVttString } from "@utils";

interface IVidPlayerProps {
  vids: Record<string | number | symbol, IVidWithCustom[]>;
  playlist: string | undefined;
  playlistDisplayName: string | undefined;
  initialData: {
    vids: IVidWithCustom[];
    chap: IVidWithCustom;
  };
  playerEnv: envPropsForPlayer;
  vttText: string;
  thumbs: InitializedResource<
    | {
        key: string;
        url: string;
        seconds: number;
        // Present when the thumb came from the OCR producer's winners.json.
        reference?: string;
        confidence?: number;
        rawText?: string;
      }[]
    | undefined
  >;
}
export function VidPlayer(props: IVidPlayerProps) {
  // I'm using the store.ts file as a way to pass around state without context.  (e.g. singletons). These setX calls at the top here run on the server once (since calling setX on any store on server is not the same value the client receives during hydration.)
  setCurrentVid(props.initialData.chap);
  setCurrentBook(props.initialData.vids);
  // next two lines disabled due to ssr and setting initial values
  // eslint-disable-next-line solid/reactivity
  setCurrentPlaylist(props.vids);

  const [jumpingForwardAmount, setJumpingForwardAmount] = createSignal();
  const [jumpingBackAmount, setJumpingBackAmount] = createSignal();
  const jumpAmount = 5;

  let playerRef: HTMLDivElement | undefined;

  //=============== OnMount augments video player  =============
  // This uses the https://github.com/brightcove/player-loader package instead of bare video js for two reasons; One is convenience, but the other is that the analytics for the playlists and player is already set versus having to wire up all the analytics.  It also leaves some of the control that is exposed in the BC Player UI since it's basically configuring the script in BC.  This must be run on mount with a dynamic import since the brightcove player loader uses the window global, which of course, doesn't run in SSR.  Since most of the functionality on the page is related to the player, there is pretty much 0 interactivity until the player loads.
  onMount(async () => {
    const curVid = currentVid;
    // mostly to satisfy ts
    if (!curVid) return;
    // get env vars from bc.

    const { accountId, playerId } = props.playerEnv;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore.  There are no types for this below
    const playerModule = await import("@brightcove/player-loader");
    const options = {
      ...PLAYER_LOADER_OPTIONS,
      refNode: playerRef,
      videoId: curVid.id,
      accountId,
      playerId,
    };

    const vPlayer = await playerModule.default(options);
    setVjsPlayer(vPlayer.ref);

    //  inline prevents auto full screen for mobile
    vPlayer.ref.playsinline(true);
    // Set to the langauge passed from the request header. Unfortunately at time of authoring, neither dictionary for videojs seems complete, so if we have an initial complete, so we import the json and merge in everything for a maximal dict if we have it, otherwise just use what comes on the player from BC.
    vPlayer.ref.language(navigator.language);

    // Handle taps on mobile for play/pause/fast forward
    const videoJsDomEl = vPlayer.ref.el();
    handleVideoJsTaps({
      el: videoJsDomEl,
      rightDoubleFxn(number) {
        const curTime = vjsPlayer()?.currentTime();
        if (!curTime) return;
        // the extra minus jumpAmount is to account for fact that min tap amoutn is 2 to diff btw double and single taps, so we still want to allow the smallest measure of jump back;
        const newTime = number * jumpAmount + curTime - jumpAmount;
        vjsPlayer()?.currentTime(newTime);
        setJumpingForwardAmount(null);
        videoJsDomEl.classList.remove("vjs-user-active");
      },
      leftDoubleFxn(number) {
        const curTime = vjsPlayer()?.currentTime();
        if (!curTime) return;

        const newTime = curTime - number * jumpAmount - jumpAmount;
        vjsPlayer()?.currentTime(newTime);
        setJumpingBackAmount(null);
        videoJsDomEl.classList.remove("vjs-user-active");
      },
      singleTapFxn() {
        const plyr = vjsPlayer();
        if (!plyr) return;
        if (plyr.paused()) {
          plyr.play();
        } else {
          plyr.pause();
        }
      },
      doubleTapUiClue(dir, tapsCount) {
        if (dir == "LEFT") {
          setJumpingBackAmount(tapsCount * jumpAmount - 5);
          setJumpingForwardAmount(null);
        } else if (dir == "RIGHT") {
          setJumpingBackAmount(null);
          setJumpingForwardAmount(tapsCount * jumpAmount - 5);
        }
      },
    });

    // On desktop, handle hotkeys for seek forward and backward
    vPlayer.ref.on("keydown", (e: KeyboardEvent) =>
      playerCustomHotKeys({
        e,
        vjsPlayer: vPlayer.ref,
        increment: jumpAmount,
        setJumpingBackAmount,
        setJumpingForwardAmount,
      }),
    );

    // setup. The reactivity in this case is the props, adn the props aren't going to change without routing to anotehr page.
    // eslint-disable-next-line solid/reactivity
    vPlayer.ref.one("loadedmetadata", async () => {
      // chapters not in the sense of book/chapter but in the sense of cue points in the video that mark verses
      handleChapters(curVid, props.vttText);
    });

    //handle the actual hovering to update the chapter spot
    // This section adds an indicator of the chapters markers on hover
    const seekBar = vPlayer.ref.controlBar.progressControl.seekBar;
    const handleProgressHover = debounce(handleProgressBarHover, 10);
    seekBar.on("mouseover", handleProgressHover);
    seekBar.el().addEventListener(
      "mouseover",
      () => {
        const currentToolTip = document.querySelector(
          ".vjs-progress-control .vjs-mouse-display",
        ) as Element;
        const seekBarEl = (<SeekBarChapterText text={currentChapLabel} />) as Node;
        currentToolTip.appendChild(seekBarEl);
      },
      {
        once: true,
      },
    );
  });
  const currChapMarker = () => {
    return currentVid.chapterMarkers;
  };
  //=============== state setters / derived  =============
  return (
    <div class={`overflow-x-hidden ${CONTAINER} w-full sm:(rounded-lg)`}>
      <div
        data-title="BookAndPlaylistName"
        class={`${mobileHorizontalPadding} sm:(py-1) text-center flex justify-between`}
      >
        <div class="flex  gap-1">
          <h1 class="font-bold">
            {" "}
            {normalizeBookName(currentVid?.localizedBookName || currentVid.book)}{" "}
            {Number(currentVid.chapter)}
          </h1>
          <p>{props.playlistDisplayName}</p>
          <a
            href={`https://studio.brightcove.com/products/videocloud/media/video-details/${currentVid.id}/overview`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Brightcove Studio"
            aria-label="Open in Brightcove Studio"
            class="inline-flex items-center text-primary hover:opacity-70"
          >
            <IconExternalLink classNames="w-4 h-4" />
          </a>
        </div>
        <button
          class="bg-primary/30 font-bold cursor-pointer text-sm p-0"
          onClick={(e) => {
            try {
              const curTime = vjsPlayer()?.currentTime();
              if (!curTime && curTime !== 0) return;
              const formatted = secondsToVttString(curTime);
              navigator.clipboard.writeText(formatted);
              const target = e.target as HTMLButtonElement;
              target.innerText = `Copied ${formatted}`;
              setTimeout(() => (target.innerText = "Copy Current Time"), 1000);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Copy Current Time
        </button>
      </div>
      <div class="relative bg-gray-200 w-full rounded-full py-3 my-2">
        <For each={currChapMarker()}>
          {(marker) => (
            <button
              style={{ left: `${marker.xPos}%` }}
              onClick={() => {
                const plyr = vjsPlayer();
                plyr?.currentTime(marker.chapterStart);
                plyr?.play();
              }}
              class={`absolute inset-0 w-6 rounded-full bg-primary text-xs text-white font-bold`}
            >
              {marker.startVerse}
            </button>
          )}
        </For>
      </div>

      <Suspense fallback={<div class="py-2">Loading...</div>}>
        {/* <Show when={props.thumbs()?.length}> */}
        <Show when={props.thumbs()?.length} fallback={<div class="py-2">No thumbs</div>}>
          <div class="flex gap-2 overflow-x-scroll py-1">
            <For each={props.thumbs()!}>
              {(img, _idx) => {
                return (
                  <div class="flex flex-col items-center flex-shrink-0 max-w-120px">
                    <span>{secondsToVttString(img.seconds)}</span>
                    <Show when={img.reference}>
                      <span class="text-xs font-semibold text-center">{img.reference}</span>
                    </Show>
                    <Show when={img.confidence !== undefined}>
                      <span class="text-xs text-gray-500">
                        {Math.round((img.confidence ?? 0) * 100)}% conf
                      </span>
                    </Show>
                    <Show when={img.seconds !== undefined && img.key && img.url}>
                      <img
                        // loading="lazy"
                        data-key={img.key}
                        src={img.url}
                        class="max-w-120px"
                        data-js="thumbImg"
                        data-seconds={img.seconds}
                        title={img.rawText ?? ""}
                        onClick={() => {
                          const plyr = vjsPlayer();
                          plyr?.currentTime(img.seconds);
                          const formatted = secondsToVttString(img.seconds);
                          navigator.clipboard.writeText(formatted);
                          // hacky way to get it to load the poster associated with this time
                          plyr?.play();
                          plyr?.pause();
                          // @ts-ignore
                          plyr?.el().focus();
                        }}
                      />
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
        {/* </Show> */}
      </Suspense>

      <div
        data-title="VideoPlayer"
        class="w-full mx-auto aspect-video  relative  sm:(rounded-lg overflow-hidden)"
      >
        {/* Chapter Back */}
        <button
          data-title="chapBack"
          class={`text-surface w-12 h-12 md:w-20 md:h-20 bg-gray-200/40 grid place-content-center rounded-full hover:( text-primary bg-primary/10) absolute left-4 top-1/2 -translate-y-1/2 z-30 ${
            (!trackAdjacentChap().prev || vjsPlayer()?.currentTime() == 0) && "hidden"
          }`}
          onClick={() => {
            getAdjacentChap("PREV");
            jumpToNextChap("PREV");
          }}
        >
          <IconChapBack />
        </button>
        <div
          ref={(el) => (playerRef = el)}
          id="PLAYER"
          class="w-full h-full grid place-content-center"
        >
          <LoadingSpinner classNames="w-16 h-16 text-primary" />
        </div>
        <Show when={jumpingBackAmount()}>
          <div
            id="seekRippleBackward"
            class="absolute w-1/4  top-0 left-0 bottom-0  grid place-content-center rounded-[0%_100%_100%_0%_/_50%_50%_50%_50%] z-40  capitalize font-bold text-base pointer-events-none seekRipple"
          >
            {String(jumpingBackAmount())}
          </div>
        </Show>
        <Show when={jumpingForwardAmount()}>
          <div
            id="seekRippleForward"
            class="absolute w-1/4  top-0 right-0 bottom-0 seekRipple  grid place-content-center capitalize font-bold text-base z-40 rounded-[100%_0%_0%_100%_/_50%_50%_50%_50%] pointer-events-none"
          >
            {String(jumpingForwardAmount())}
          </div>
        </Show>

        <button
          data-title="chapNext"
          class={`text-surface w-12 h-12 md:w-20 md:h-20 bg-gray-200/40 grid place-content-center rounded-full hover:( text-primary bg-primary/10) absolute right-4 top-1/2 -translate-y-1/2 z-30 ${
            (!trackAdjacentChap().next || vjsPlayer()?.currentTime() == 0) && "hidden"
          }`}
          onClick={() => {
            getAdjacentChap("NEXT");
            jumpToNextChap("NEXT");
          }}
        >
          <IconChapNext />
        </button>
      </div>

      <div data-title="VideoSupplmental" class="py-2 px-2">
        <div data-title="videoControl" class="flex gap-2">
          {/* Chapter Forward */}
          <span class="inline-flex gap-1 items-center">
            <input
              type="range"
              class="speedRange appearance-none bg-transparent cursor-pointer w-60 "
              min=".25"
              max="5"
              step=".25"
              value={1}
              onInput={(e) => {
                setPlayerSpeed(e.target.value);
              }}
              onChange={(e) => {
                handlePlayRateChange(e);
              }}
            />
            <span class="inline-block h-5 w-5">
              <SpeedIcon />
            </span>
            <span class="inline-block ml-2">{playerSpeed()}</span>
          </span>
          {/* Speed Preference */}
        </div>
      </div>
    </div>
  );
}
