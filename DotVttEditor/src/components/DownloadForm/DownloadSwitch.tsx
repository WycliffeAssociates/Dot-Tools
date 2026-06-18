import { Switch } from "@kobalte/core";

interface IDownloadSwitch {
  formName: string;
  defaultIsChecked: boolean;
  onCheckedChange: (arg: boolean) => void;
  switchLabel: string;
}
export function DownloadSwitch(props: IDownloadSwitch) {
  return (
    <Switch.Root
      defaultChecked={props.defaultIsChecked}
      name={props.formName}
      class="switch"
      onChange={(val: boolean) => props.onCheckedChange(val)}
    >
      <Switch.Label class="switch__label">{props.switchLabel}</Switch.Label>
      <Switch.Input class="switch__input" />
      <Switch.Control class="w-12 h-6 rounded-full bg-surface/20 grid place-content-center relative p-2 relative data-[checked]:(bg-primary/30)">
        <Switch.Thumb class="rounded-full h-full w-1/2 absolute left-0 bg-surface/10 transition duration-150 data-[checked]:text-primary/80 data-[checked]:(translate-x-100% bg-primary)" />
      </Switch.Control>
    </Switch.Root>
  );
}
