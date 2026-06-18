import { DotLogo, IconMajesticonsCloseLine, IconMenu } from "@components/Icons";
import { mobileHorizontalPadding } from "@lib/UI";
import { ToggleButton } from "@kobalte/core";
import { Show, createSignal } from "solid-js";

type HeaderProps = {
  initialPath: string;
};
export function Header(_props: HeaderProps) {
  const [menuIsOpen, setMenuIsOpen] = createSignal(false);

  return (
    <div class="relative">
      <header class={`${mobileHorizontalPadding} py-2 flex justify-between items-center relative`}>
        <span class="w-32 md:w-48">
          <DotLogo />
        </span>
        <div class="flex gap-2">
          <ToggleButton.Root pressed={menuIsOpen()} onChange={() => setMenuIsOpen(!menuIsOpen())}>
            <IconMenu classNames="w-8" />
          </ToggleButton.Root>
        </div>
        {/* </span> */}
      </header>
      <Show when={menuIsOpen()}>
        <div
          class="fixed inset-0 bg-black/30 dark:bg-black/50 z-30"
          onClick={() => setMenuIsOpen(false)}
        />
      </Show>
      <div class="relative overflow-hidden w-full">
        <div
          class={`w-full max-w-md  z-40 bg-white absolute right-0 top-0 transform transition-250 translate-x-full p-4 h-full fixed rounded-md dark:bg-[#181817] ${
            menuIsOpen() ? "translate-x-0!" : ""
          }`}
        >
          <button
            class="block ml-auto text-4xl hover:(text-primary) focus:(text-primary) transform active:(scale-95)"
            onClick={() => setMenuIsOpen(!menuIsOpen())}
          >
            <IconMajesticonsCloseLine />
          </button>
        </div>
      </div>
    </div>
  );
}
