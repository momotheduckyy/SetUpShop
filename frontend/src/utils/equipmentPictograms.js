// frontend/src/utils/equipmentPictograms.js

/**
 * All pictograms assume the context has already been:
 *  - translated so (0,0) is the center of the tool
 *  - rotated to eq.rotationDeg
 *
 * w, h are in *feet*, same as your equipment widthFt/depthFt.
 * So the rectangle spans x: -w/2..w/2, y: -h/2..h/2.
 */

function hexToRgba(hex, alpha = 0.5) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h.split("").map(ch => ch + ch).join("");
  }
  if (h.length !== 6) return `rgba(0,0,0,${alpha})`;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function drawRect(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/* -------- Individual pictograms -------- */

function drawTableSawTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;
  const inset = Math.min(w, h) * 0.12;

  const tableX = left + inset;
  const tableY = top + inset;
  const tableW = w - inset * 2;
  const tableH = h - inset * 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Table
  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, tableX, tableY, tableW, tableH);

  // Blade slot
  const slotW = tableW * 0.3;
  const slotH = tableH * 0.01;
  const slotX = 0 - slotW / 2;
  const slotY = top + h * 0.75;
  ctx.fillStyle = "#4b5563";
  ctx.fillRect(slotX, slotY, slotW, slotH);

  // Fence
  const fenceH = tableH * 0.06;
  const fenceY = tableY + tableH * 0.5;
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(tableX, fenceY, tableW, fenceH);

  // 
  ctx.restore();
}

function drawBandSawTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Column
  const colW = w * 0.45;
  const colH = h * 0.7;
  const colX = left + w * 0.05;
  const colY = top + h * 0.15;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, colX, colY, colW, colH);

  // Wheels
  const wheelR = Math.min(colW, colH) * 0.25;
  const wheelCX = colX + colW * 0.65;
  const wheelTopCY = colY + colH * 0.25;
  const wheelBotCY = colY + colH * 0.75;

  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = Math.min(w, h) * 0.015;

  ctx.beginPath();
  ctx.arc(wheelCX, wheelTopCY, wheelR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(wheelCX, wheelBotCY, wheelR, 0, Math.PI * 2);
  ctx.stroke();

  // Table
  const tableW = w * 0.6;
  const tableH = h * 0.18;
  const tableX = left + (w - tableW) / 2;
  const tableY = top + h * 0.45;

  ctx.fillStyle = "#d1d5db";
  drawRect(ctx, tableX, tableY, tableW, tableH);

  // Blade
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = Math.min(w, h) * 0.01;
  const bladeX = tableX + tableW * 0.55;
  ctx.beginPath();
  ctx.moveTo(bladeX, top + h * 0.05);
  ctx.lineTo(bladeX, top + h * 0.95);
  ctx.stroke();

  ctx.restore();
}

function drawPlanerTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Base / body
  const bodyInset = Math.min(w, h) * 0.1;
  const bodyX = left + bodyInset;
  const bodyY = top + bodyInset;
  const bodyW = w - bodyInset * 2;
  const bodyH = h - bodyInset * 2;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, bodyX, bodyY, bodyW, bodyH);

  // Infeed / outfeed
  const feedH = bodyH * 0.25;
  ctx.fillStyle = "#d1d5db";
  drawRect(ctx, bodyX, bodyY, bodyW, feedH); // infeed
  drawRect(ctx, bodyX, bodyY + bodyH - feedH, bodyW, feedH); // outfeed

  // Cutterhead indication
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(bodyX, bodyY + bodyH / 2 - feedH * 0.2, bodyW, feedH * 0.4);

  ctx.restore();
}

function drawSanderTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Base
  const baseInset = Math.min(w, h) * 0.12;
  const baseX = left + baseInset;
  const baseY = top + baseInset;
  const baseW = w - baseInset * 2;
  const baseH = h - baseInset * 2;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, baseX, baseY, baseW, baseH);

  // Belt (rectangle across)
  const beltH = baseH * 0.3;
  const beltY = baseY + baseH * 0.15;
  ctx.fillStyle = "#d97757";
  drawRect(ctx, baseX, beltY, baseW * 0.65, beltH);

  // Disc (circle)
  const discR = Math.min(baseW, baseH) * 0.22;
  const discCX = baseX + baseW * 0.8;
  const discCY = baseY + baseH * 0.7;

  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.arc(discCX, discCY, discR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawCNCRouterTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Big bed
  const bedInset = Math.min(w, h) * 0.08;
  const bedX = left + bedInset;
  const bedY = top + bedInset;
  const bedW = w - bedInset * 2;
  const bedH = h - bedInset * 2;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, bedX, bedY, bedW, bedH);

  // Grid lines
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = Math.min(w, h) * 0.01;
  const cols = 4;
  const rows = 4;
  for (let i = 1; i < cols; i++) {
    const x = bedX + (bedW * i) / cols;
    ctx.beginPath();
    ctx.moveTo(x, bedY);
    ctx.lineTo(x, bedY + bedH);
    ctx.stroke();
  }
  for (let j = 1; j < rows; j++) {
    const y = bedY + (bedH * j) / rows;
    ctx.beginPath();
    ctx.moveTo(bedX, y);
    ctx.lineTo(bedX + bedW, y);
    ctx.stroke();
  }

  // Gantry
  const gantryY = bedY + bedH * 0.25;
  const gantryH = bedH * 0.15;
  ctx.fillStyle = "#9ca3af";
  drawRect(ctx, bedX, gantryY, bedW, gantryH);

  // Spindle carriage
  const carW = bedW * 0.12;
  const carH = gantryH * 0.8;
  const carX = bedX + bedW * 0.5 - carW / 2;
  const carY = gantryY + gantryH * 0.1;
  ctx.fillStyle = "#4b5563";
  drawRect(ctx, carX, carY, carW, carH);

  ctx.restore();
}

function drawDrillPressTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Base
  const baseW = w * 0.6;
  const baseH = h * 0.18;
  const baseX = left + (w - baseW) / 2;
  const baseY = top + h * 0.78;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, baseX, baseY, baseW, baseH);

  // Column
  const colW = w * 0.12;
  const colH = h * 0.55;
  const colX = 0 - colW / 2;
  const colY = baseY - colH;

  ctx.fillStyle = "#d1d5db";
  drawRect(ctx, colX, colY, colW, colH);

  // Table
  const tableW = w * 0.65;
  const tableH = h * 0.16;
  const tableX = left + (w - tableW) / 2;
  const tableY = colY + colH * 0.45;

  ctx.fillStyle = "#f3f4f6";
  drawRect(ctx, tableX, tableY, tableW, tableH);

  // Drill point
  ctx.fillStyle = "#4b5563";
  const r = Math.min(tableW, tableH) * 0.08;
  ctx.beginPath();
  ctx.arc(0, tableY + tableH / 2, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawJointerTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  // Long beds
  const bedInset = Math.min(w, h) * 0.15;
  const bedX = left + bedInset;
  const bedY = top + h * 0.25;
  const bedW = w - bedInset * 2;
  const bedH = h * 0.22;

  // Fence line
  ctx.strokeStyle = "#4d515aff";
drawRect(ctx, left + w*.75, top, bedW*0.25, h);

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, bedX, bedY, bedW, bedH);

  // Cutterhead region (middle)
  const cutW = bedW * 0.12;
  const cutX = 0 - cutW / 2;
  ctx.fillStyle = "#9ca3af";
  drawRect(ctx, cutX, bedY, cutW, bedH);



  ctx.restore();
}

function drawGenericMachineTop(ctx, w, h) {
  const left = -w / 2;
  const top = -h / 2;

  ctx.save();
  ctx.lineWidth = Math.min(w, h) * 0.02;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";

  const inset = Math.min(w, h) * 0.15;
  const bodyX = left + inset;
  const bodyY = top + inset;
  const bodyW = w - inset * 2;
  const bodyH = h - inset * 2;

  ctx.fillStyle = "#e5e7eb";
  drawRect(ctx, bodyX, bodyY, bodyW, bodyH);

  ctx.restore();
}

/**
 * Dispatch based on equipment name/model.
 * Uses your seed data:
 *  "Table Saw", "Band Saw", "Planer", "Belt/Disc Sander",
 *  "CNC Router", "Drill Press", "Jointer"
 */
// Draw dashed "use area" around the tool footprint in *local* (rotated) coords.
// w, h are tool width/depth in feet.
// Draw dashed "use area" around the tool footprint in *local* (rotated) coords.
// w, h are tool width/depth in feet.
export function drawEquipmentUseArea(ctx, eq, w, h) {
  const name = (eq.name || "").toLowerCase();
  const model = (eq.model || "").toLowerCase();

  let areaX = -w / 2;
  let areaY = -h / 2;
  let areaW = w;
  let areaH = h;
  let hasArea = false;

  const setArea = (leftExtra, rightExtra, topExtra, bottomExtra) => {
    areaX = -w / 2 - leftExtra;
    areaY = -h / 2 - topExtra;
    areaW = w + leftExtra + rightExtra;
    areaH = h + topExtra + bottomExtra;
    hasArea = true;
  };

  // --- clearance rules (same as before) ---
  if (name.includes("table saw") || model.includes("pcs31230")) {
    // 8 ft left & right
    setArea(8, 8, 0, 0);

  } else if (name.includes("planer") || model.includes("dw735")) {
    // 6 ft top & bottom
    setArea(0, 0, 6, 6);

  } else if (name.includes("drill press") || model.includes("18-900l")) {
    setArea(0, 0, 0, 2);

  } else if (name.includes("jointer") || model.includes("jwj-8cs")) {
    setArea(2, 0, 6, 6);

  } else if (
    name.includes("belt/disc") ||
    (name.includes("belt") && name.includes("sander")) ||
    model.includes("31-735")
  ) {
    setArea(2, 0, 0, 2);

  } else if (
    name.includes("band saw") ||
    name.includes("bandsaw") ||
    model.includes("pm1500")
  ) {
    setArea(0, 0, 4, 4);

  } else if (name.includes("cnc") || model.includes("c-103")) {
    setArea(2, 2, 2, 2);

  } else {
    hasArea = false;
  }

  if (!hasArea) return;

  ctx.save();

  // 🔹 Semi-transparent colored fill (based on eq.color)
  const fillColor = hexToRgba(eq.color || "#888", 0.25); // 25% alpha
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.rect(areaX, areaY, areaW, areaH);
  ctx.fill();

  // 🔹 Grey dashed outline over the fill
  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = Math.min(w, h) * 0.04;
  ctx.setLineDash([0.5, 0.5]); // 0.5 ft dash, 0.5 ft gap

  ctx.stroke(); // stroke the same rect path

  // Reset dash + restore
  ctx.setLineDash([]);
  ctx.restore();
}





export function drawEquipmentPictogram(ctx, eq, w, h) {
  const name = (eq.name || "").toLowerCase();
  const model = (eq.model || "").toLowerCase();

  if (name.includes("table saw") || model.includes("pcs31230")) {
    drawTableSawTop(ctx, w, h);
  } else if (name.includes("band saw") || name.includes("bandsaw") || model.includes("pm1500")) {
    drawBandSawTop(ctx, w, h);
  } else if (name.includes("planer") || model.includes("dw735")) {
    drawPlanerTop(ctx, w, h);
  } else if (name.includes("belt/disc") || name.includes("belt") && name.includes("sander") || model.includes("31-735")) {
    drawSanderTop(ctx, w, h);
  } else if (name.includes("cnc") || model.includes("c-103")) {
    drawCNCRouterTop(ctx, w, h);
  } else if (name.includes("drill press") || model.includes("18-900l")) {
    drawDrillPressTop(ctx, w, h);
  } else if (name.includes("jointer") || model.includes("jwj-8cs")) {
    drawJointerTop(ctx, w, h);
  } else {
    drawGenericMachineTop(ctx, w, h);
  }
}
