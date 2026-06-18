export function ChapterMarker(props: { leftAmt: string }) {
  return (
    <span
      data-role="chapterMarker"
      class="w-1 h-full inline-block bg-primary absolute"
      style={{ left: `${props.leftAmt}%` }}
    />
  );
}

export function cleanUpOldChapters() {
  const elements = document.querySelectorAll('[data-role="chapterMarker"]');
  elements.forEach((element) => {
    element.remove();
  });
}
