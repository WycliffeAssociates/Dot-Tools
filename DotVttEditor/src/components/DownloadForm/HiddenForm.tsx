import { DOWNLOAD_SERVICE_WORK_URL } from "@lib/routes";
import { downloadPreference } from "@lib/store";
import { Show } from "solid-js";
interface IHiddenForm {
  name: string;
}
export function HiddenForm(props: IHiddenForm) {
  return (
    <form action={DOWNLOAD_SERVICE_WORK_URL} method="post" name={props.name}>
      <input
        type="hidden"
        name="swPayload"
        value={JSON.stringify(downloadPreference().swPayload)}
      />
      <input
        type="hidden"
        name="swDownloadDevice"
        value={String(downloadPreference().downloadOffline)}
      />
      <input
        type="hidden"
        name="swSaveSw"
        value={String(downloadPreference().saveToServiceWorker)}
      />
      <Show
        when={
          (downloadPreference().saveToServiceWorker || downloadPreference().downloadOffline) &&
          downloadPreference().swPayload
        }
      >
        <button class="dark:(bg-surface/10 border border-primary/60 hover:(border-primary/90 bg-surface/20)) hover:(bg-neutral-300) active:(scale-98) px-4 py-2 rounded mt-2 bg-neutral-200 border border-primary">
          Submit
        </button>
      </Show>
    </form>
  );
}
