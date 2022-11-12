import Tooltip from './tooltip';
import {
  regionData,
  RegionName,
  getRegionPaths,
  getRegionColor,
  getDepartmentName,
  getRegionByDepartment,
} from './regions';

import './assets/main.scss';
import map from './assets/map_monochrome.svg';

const app = document.getElementById('app') as HTMLDivElement;
app.innerHTML = /* html */ `
  <header class="header">
    <div class="header-logo"></div>
    <nav>
				<a href="https://listenbourg.org" class="nav-btn important">
          listenbourg.org
        </a>
    </nav>
  </header>
  <main class="main">
    <div class="tooltip"></div>
    <object data="${map}" type="image/svg+xml"></object>
  </main>
  <footer class="footer">
    © Listenbourg - 2022 -
    <a href="https://twitter.com/DevListenbourg">Twitter</a> -
    <a href="https://github.com/Listenbourg/Map">Github</a>
  </footer>
`;

window.addEventListener('load', () => {
  const svgObject = document.querySelector('object')!.contentDocument!;
  const svgEl = svgObject.querySelector('svg')!;
  const { setTooltip, hideTooltip } = Tooltip(
    document.querySelector('object')!,
    app.querySelector('.tooltip')!
  );
  const groups = svgObject.querySelectorAll('g');
  const svgDepTexts: SVGTextElement[] = [];

  const regionsPaths = Object.fromEntries(
    Object.keys(regionData).map((name) => [
      name,
      getRegionPaths(svgObject, name as RegionName),
    ])
  );

  type Hovered = {
    region: RegionName;
    depID: number;
    depName: string;
  } | null;

  const minZoom = 0.5;

  let hovered: Hovered = null;
  let zoom = minZoom;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  function updateTransform() {
    svgEl.style.transform = `
      translate(${offsetX * zoom}px, ${offsetY * zoom}px)
      scale(${zoom})`;
  }

  updateTransform();

  const BREAKPOINT_ZOOM = 1.2;

  svgObject.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      const oldZoom = zoom;
      zoom = Math.max(minZoom, zoom - zoom * e.deltaY * 0.0009);

      updateTransform();
      svgEl.style.cursor = zoom === minZoom ? 'pointer' : 'grab';

      if (zoom > BREAKPOINT_ZOOM && oldZoom <= BREAKPOINT_ZOOM) {
        svgEl.style.setProperty('--text-display', 'block');
        hideTooltip();
      } else if (zoom <= BREAKPOINT_ZOOM && oldZoom > BREAKPOINT_ZOOM) {
        svgEl.style.setProperty('--text-display', 'none');
      }

      svgEl.style.setProperty('--text-fz', `${Math.min(.8, (1 / zoom) * 2)}rem`);

      e.preventDefault();
    },
    { passive: false }
  );

  svgObject.addEventListener('mousedown', () => {
    dragging = true;
    svgEl.style.cursor = 'grabbing';
  });
  svgObject.addEventListener('mouseup', () => {
    dragging = false;
    svgEl.style.cursor = zoom === minZoom ? 'pointer' : 'grab';
  });

  svgObject.addEventListener('mousemove', (e) => {
    let isHovered = false;
    groups.forEach((d) => {
      if (d.matches(':hover')) isHovered = true;
    });
    if (!isHovered) {
      hideTooltip();
    } else if (hovered && zoom < BREAKPOINT_ZOOM) {
      setTooltip(e, `${hovered.depID} ${hovered.depName} (${hovered.region})`);
    }

    if (dragging) {
      offsetX += e.movementX / zoom;
      offsetY += e.movementY / zoom;
      updateTransform();
    }
  });

  svgEl.style.overflow = 'hidden';
  svgEl.style.cursor = 'pointer';

  groups.forEach((group) => {
    const path = group.querySelector('path')!;
    const groupID = Number(group.id);
    const departmentName = getDepartmentName(groupID);
    const regionName = getRegionByDepartment(groupID)!;
    const regionColor = getRegionColor(regionName as RegionName);

    path.style.setProperty('--region-color-light', regionColor[0]);
    path.style.setProperty('--region-color-dark', regionColor[1]);

    const textEl = svgObject.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    const pathRect = path.getBBox();
    textEl.setAttribute('x', (pathRect.x + pathRect.width / 2).toString());
    textEl.setAttribute('y', (pathRect.y + pathRect.height / 2).toString());
    textEl.setAttribute('dominant-baseline', 'middle');
    textEl.setAttribute('text-anchor', 'middle');
    textEl.style.userSelect = 'none';
    textEl.style.webkitUserSelect = 'none';
    textEl.style.pointerEvents = 'none';
    textEl.innerHTML = departmentName;
    group.appendChild(textEl);
    svgDepTexts.push(textEl);

    path.style.transition = 'fill 0.25s ease';

    group.addEventListener('mouseenter', () => {
      hovered = {
        region: regionName as RegionName,
        depID: groupID,
        depName: departmentName,
      };
    });

    group.addEventListener('mouseleave', () => {
      for (const path of regionsPaths[regionName]) path.style.fill = '';
    });
  });
});
