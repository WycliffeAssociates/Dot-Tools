import { RadioGroup } from "@kobalte/core";
import { For } from "solid-js";

interface IDownloadRadio {
  formName: string;
  defaultValue: string;
  onValueChange: (arg: string) => void;
  radioLabel: string;
  radioOptions: Array<{
    text: string;
    value: string;
  }>;
}
export function DownloadRadio(props: IDownloadRadio) {
  return (
    <RadioGroup.Root
      class="radio-group"
      name={props.formName}
      defaultValue={props.defaultValue}
      onChange={(val) => props.onValueChange(val)}
    >
      <RadioGroup.Label class="radio-group__label">{props.radioLabel}</RadioGroup.Label>
      <div class="">
        <For each={props.radioOptions}>
          {(opt) => (
            <RadioGroup.Item value={opt.value} class="flex gap-2">
              <RadioGroup.ItemInput class="radio__input" />
              <RadioGroup.ItemControl class="w-6 h-6 rounded-full bg-surface/20 grid place-content-center relative p-2">
                <RadioGroup.ItemIndicator class="absolute w-3/5 h-3/5 inset-20% rounded-full block bg-primary" />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemLabel class="radio__label">{opt.text}</RadioGroup.ItemLabel>
            </RadioGroup.Item>
          )}
        </For>
      </div>
    </RadioGroup.Root>
  );
}
