import svgPanZoom from "./svg-pan-zoom/svg-pan-zoom";
import Tooltip from "./tooltip";

window.addEventListener("load", async () => {
	const SVG_OBJECT = document.querySelector(
		"#listenmap-svg"
	) as HTMLObjectElement;
	const resizeHeight = () =>
		(SVG_OBJECT.style.height =
			document.body.clientHeight -
			(document.querySelector("header")?.scrollHeight || 0) -
			1 -
			(document.querySelector("footer")?.scrollHeight || 0) -
			1 +
			"px");

	await sleep(150);

	const SVG_ELEM = SVG_OBJECT.contentDocument!.documentElement as unknown as SVGSVGElement;

	SVG_ELEM.querySelectorAll("g.depart").forEach((group) => {
		const textEl = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'text'
		  );
		  const path = group.querySelector("path") as SVGPathElement;
		  const pathRect = path.getBBox();
		  textEl.setAttribute('x', (pathRect.x + pathRect.width / 2).toString());
		  textEl.setAttribute('y', (pathRect.y + pathRect.height / 2).toString());
		  textEl.setAttribute('dominant-baseline', 'middle');
		  textEl.setAttribute('text-anchor', 'middle');
		  textEl.classList.add("depart-text");
		  textEl.style.userSelect = 'none';
		  textEl.style.webkitUserSelect = 'none';
		  textEl.style.pointerEvents = 'none';
		  const departName = group.getAttribute("data-depart-name")!;
		  const regionName = group.parentElement!.getAttribute("data-region-name")!;
		  textEl.innerHTML = `${departName} (${regionName})`;;
		  group.appendChild(textEl);
	})



SVG_ELEM.querySelectorAll("g.city").forEach((group) => {
	const textEl = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'text'
	  );
	  const path = group.querySelector("circle") as SVGCircleElement;
	  const pathRect = path.getBBox();
	  textEl.setAttribute('x', (pathRect.x + pathRect.width / 2).toString());
	  textEl.setAttribute('y', (pathRect.y + pathRect.height / 2).toString());
	  textEl.setAttribute('dominant-baseline', 'middle');
	  textEl.setAttribute('text-anchor', 'middle');
	  textEl.style.userSelect = 'none';
	  textEl.style.webkitUserSelect = 'none';
	  textEl.style.pointerEvents = 'none';
	  textEl.innerHTML = group.attributes.getNamedItem("data-city-name")!.value;
	  textEl.classList.add("city-text");
	  group.appendChild(textEl);
})


	await sleep(50);
	const { setTooltip, hideTooltip } = Tooltip(
		SVG_OBJECT,
		document.querySelector("#tooltip") as HTMLDivElement
	);
	const map = svgPanZoom(SVG_OBJECT, {
		zoomEnabled: true,
		controlIconsEnabled: false,
		preventMouseEventsDefault: false,
		fit: 1,
		center: 1,
		zoomScaleSensitivity: 0.3,
		minZoom: 0.75,
		maxZoom: 6,
	});
	resizeHeight();
	SVG_ELEM.addEventListener("mousemove", (e: any) => {
		const region = (e.path as SVGElement[]).find((el) =>
			el?.classList?.contains("region")
		);
		const regionName = region?.getAttribute("data-region-name") || "";
		const depart = (e.path as SVGElement[]).find((el) =>
			el?.classList?.contains("depart")
		);
		const departName = depart?.getAttribute("data-depart-name") || "";
		region
			? setTooltip(e, `${depart?.id} ${departName} (${regionName})`)
			: hideTooltip();
	});
	resizeHeight();
	map.resize();
	map.fit();
	map.center();
	window.addEventListener("resize", () => {
		resizeHeight();
		map.resize();
		map.fit();
		map.center();
	});
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
