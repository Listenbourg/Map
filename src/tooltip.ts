export default function Tooltip(svg: HTMLObjectElement, element: HTMLElement) {
  function setTooltip(e: MouseEvent, content: string) {
    element.innerHTML = content;
    element.style.display = "block";

    element.style.left = e.pageX + 25 + "px";    

    if (
      element.getBoundingClientRect().right >
      svg.getBoundingClientRect().right
    ) {
      element.style.left = e.pageX - element.clientWidth + "px";
      element.style.top = e.pageY + 25 + "px";
    } else {
      element.style.top = e.pageY + "px";
    }
  }

  function hideTooltip() {
    element.style.display = "none";
  }

  return { setTooltip, hideTooltip };
}
