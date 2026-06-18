import { DownloadSwitch } from "@components/DownloadForm/DownloadSwitch";
import { DownloadRadio } from "@components/DownloadForm/DownloadRadio";
import { HiddenForm } from "@components/DownloadForm/HiddenForm";
import { WholeDownloadSelect } from "@components/DownloadForm/DownloadSelect";

import { downloadPreference, setDownloadPreference } from "@lib/store";
import { Show } from "solid-js";
import type { wholeBookPresets } from "@customTypes/types";
import { SingleDownloadSelect } from "@components/DownloadForm/DownloadSelect";
import { currentMp4Sources, wholeBooksOptionsForSelect, populateSwPayload } from "@lib/UI";

interface IDownloadMenu {
  formDataRef: HTMLFormElement | undefined;
  formName: string;
}
export function DownloadMenu(props: IDownloadMenu) {
  return (
    <>
      <form
        action="/"
        name="downloadData"
        id="downloadDataForm"
        ref={props.formDataRef}
        class="flex flex-col gap-2"
      >
        <DownloadRadio
          formName={props.formName}
          defaultValue="chapter"
          onValueChange={(val) =>
            setDownloadPreference((prev) => {
              return {
                ...prev,
                swPayload: null,
                justThisVideo: val != "book",
              };
            })
          }
          radioLabel="Download Scope"
          radioOptions={[
            { text: "Whole Book", value: "book" },
            { text: "Just this video", value: "chapter" },
          ]}
        />

        <Show when={downloadPreference().justThisVideo}>
          <div class="relative z-10">
            <SingleDownloadSelect
              formName={props.formName}
              placeholder="Select video quality"
              selectOptions={currentMp4Sources()!}
              onValueChange={(val) => populateSwPayload({ type: "VID", val })}
            />
          </div>
        </Show>

        <Show when={!downloadPreference().justThisVideo}>
          <div class="relative z-10">
            <WholeDownloadSelect
              formName={props.formName}
              placeholder="Select playlist quality"
              selectOptions={wholeBooksOptionsForSelect()!}
              onValueChange={(val: wholeBookPresets) => populateSwPayload({ type: "BOOK", val })}
            />
          </div>
        </Show>

        <DownloadSwitch
          formName={props.formName}
          defaultIsChecked={downloadPreference().downloadOffline}
          onCheckedChange={(isChecked) =>
            setDownloadPreference((prev) => {
              return {
                ...prev,
                downloadOffline: isChecked,
              };
            })
          }
          switchLabel=" Download To Device"
        />

        <DownloadSwitch
          formName={props.formName}
          defaultIsChecked={downloadPreference().saveToServiceWorker}
          onCheckedChange={(isChecked) =>
            setDownloadPreference((prev) => {
              return {
                ...prev,
                saveToServiceWorker: isChecked,
              };
            })
          }
          switchLabel="Save offline"
        />
      </form>
      <HiddenForm name={props.formName} />
    </>
  );
}
