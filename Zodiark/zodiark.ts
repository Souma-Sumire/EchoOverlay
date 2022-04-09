import {
  addOverlayListener,
  callOverlayHandler,
} from "./resources/overlay_plugin_api";
import { EventMap } from "./types/event";
import { EventResponses } from "./types/event";
import logDefinitions from "./resources/netlog_defs";
import ZoneID from "./resources/zone_id";
import "./resources/defaults.css";
// class Zodiark { }
const getCanvasElementById = (id: string): HTMLCanvasElement => {
  const canvas = document.getElementById(id);

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(
      `The element of id "${id}" is not a HTMLCanvasElement. Make sure a <canvas id="${id}""> element is present in the document.`
    );
  }

  return canvas;
};
const getCanvasRenderingContext2D = (
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D => {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error(
      "This browser does not support 2-dimensional canvas rendering contexts."
    );
  }

  return context;
};

function drawChariot(x: number, y: number, radius: number) {
  zooCtx.save();
  zooCtx.beginPath();
  // ctx.fillStyle = "rgba(255,249,192,0.5)";
  x = (x - 80) * scale;
  y = (y - 80) * scale;
  radius = radius * scale;
  // x = (x - 90) * scale;
  zooCtx.arc(x, y, radius, 0, 2 * Math.PI);
  zooCtx.closePath();
  zooCtx.fill();
  zooCtx.restore();
}

function drawDynamo(x: number, y: number, r1: number, r2: number) {
  zooCtx.save();
  // ctx.fillStyle = "rgba(255,249,192,0.8)";
  x = (x - 80) * scale;
  y = (y - 80) * scale;
  r1 = r1 * scale;
  r2 = r2 * scale;
  zooCtx.beginPath();
  zooCtx.arc(x, y, r1, 0, Math.PI * 2);
  zooCtx.closePath();
  zooCtx.fill();
  zooCtx.globalCompositeOperation = "destination-out";
  zooCtx.beginPath();
  zooCtx.arc(x, y, r2, 0, Math.PI * 2);
  zooCtx.closePath();
  zooCtx.fill();
  zooCtx.restore();
}
enum Direction {
  H,
  V,
}

function drawStripe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  direction: Direction
) {
  if (direction == Direction.H) {
    y = y - h / 2;
  } else {
    [w, h] = [h, w];
    x = x - w / 2;
  }
  ctx.save();
  x = (x - 80) * scale;
  y = (y - 80) * scale;
  w = w * scale;
  h = h * scale;
  ctx.beginPath();
  ctx.fillRect(x, y, w, h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  ctx.save();
  ctx.beginPath();
  // ctx.fillStyle = "rgba(255,249,192,0.5)";
  x = (x - 80) * scale;
  y = (y - 80) * scale;
  radius = radius * scale;
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Quetzalcoatl 89.5 110.5
// Behemoth     89.5 110.5
// Python       (79.5 (84.5 105.5)) (79.5 (94.5 115.5))  (121 (84.5 105.5)) (121 (94.5 94.5))
enum Loc {
  L,
  R,
  T,
  B,
}

function drawQuetzalcoatl(h: Loc, v: Loc) {
  if (verbose) {
    console.log(`月环:${h},${v}`);
  }
  let x = h == Loc.L ? 89.5 : 110.5;
  let y = v == Loc.T ? 89.5 : 110.5;
  drawDynamo(x, y, 15, 5);
}
function drawBehemoth(h: Loc, v: Loc) {
  if (verbose) {
    console.log(`钢铁:${h},${v}`);
  }
  let x = h == Loc.L ? 89.5 : 110.5;
  let y = v == Loc.T ? 89.5 : 110.5;
  drawChariot(x, y, 15);
}
function drawPythons(p: Loc) {
  switch (p) {
    case Loc.T:
      drawStripe(zooCtx, 79.5, 84.5, 42, 11, Direction.H);
      drawStripe(zooCtx, 79.5, 105.5, 42, 11, Direction.H);
      break;
    case Loc.B:
      drawStripe(zooCtx, 79.5, 94.5, 42, 11, Direction.H);
      drawStripe(zooCtx, 79.5, 115.5, 42, 11, Direction.H);
      break;
    case Loc.L:
      drawStripe(zooCtx, 84.5, 79.5, 42, 11, Direction.V);
      drawStripe(zooCtx, 105.5, 79.5, 42, 11, Direction.V);
      break;
    case Loc.R:
      drawStripe(zooCtx, 94.5, 79.5, 42, 11, Direction.V);
      drawStripe(zooCtx, 115.5, 79.5, 42, 11, Direction.V);
      break;
  }
}

function drawFires(isHorizontal: boolean) {
  // Hide(false)
  let startAngle = isHorizontal ? -45 : +45;
  let start = startAngle * (Math.PI / 180);
  let end = (startAngle + 90) * (Math.PI / 180);
  drawArc(fireCtx, 100, 100, 30, start, end);
  startAngle += 180;
  start = startAngle * (Math.PI / 180);
  end = (startAngle + 90) * (Math.PI / 180);
  drawArc(fireCtx, 100, 100, 30, start, end);
}

class Point2D {
  public x: number;
  public y: number;
  public r: number;
  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}
const verbose = true;
const debug = true;

let hide = true;
let zoneID = 0;
const ctx: CanvasRenderingContext2D = getCanvasRenderingContext2D(
  getCanvasElementById("field")
);
const size = 400;
let transparence = getQueryletiable("transparence");
if (transparence === "false") {
  transparence = "0.5";
}
addUnlockText();
getCanvasElementById(
  "field"
).style.background = `rgba(82, 82, 82,${transparence})`;
// ctx.fillStyle = 'rgba(82, 82, 82, 0.5)'
// getCanvasElementById('field').style.width = '400px'
// getCanvasElementById('field').style.height = '400px'
// ctx.scale(1, -1);
// ctx.translate(0, -height);
const scale = size / (120 - 80);
const playerPos = new Point2D(100, 100, 0);
let isClockwise = 0;

const zoo = document.createElement("canvas");
zoo.width = size;
zoo.height = size;
const zooCtx: CanvasRenderingContext2D = zoo.getContext("2d")!;
zooCtx.fillStyle = "rgba(255,249,192,0.8)";

const pythons = document.createElement("canvas");
pythons.width = size;
pythons.height = size;
const pythonsCtx: CanvasRenderingContext2D = pythons.getContext("2d")!;
pythonsCtx.fillStyle = "rgba(255,249,192,0.8)";

const fire = document.createElement("canvas");
fire.width = size;
fire.height = size;
const fireCtx: CanvasRenderingContext2D = fire.getContext("2d")!;
fireCtx.fillStyle = "rgba(255,249,192,0.8)";

const player = document.createElement("canvas");
player.width = size;
player.height = size;
const playerCtx: CanvasRenderingContext2D = player.getContext("2d")!;
playerCtx.fillStyle = "#66CCFF";
// (80, 120)(120, 120)
// (80, 80)(120, 80)
// draw();
window.requestAnimationFrame(draw);

function showExample() {
  drawBehemoth(Loc.L, Loc.T);
  drawBehemoth(Loc.R, Loc.T);
  drawQuetzalcoatl(Loc.L, Loc.B);
  drawQuetzalcoatl(Loc.R, Loc.B);
  drawFires(true);
  drawPythons(Loc.L);
}
function getQueryletiable(letiable: string) {
  let query = window.location.search.substring(1);
  let lets = query.split("&");
  for (let i = 0; i < lets.length; i++) {
    let pair = lets[i].split("=");
    if (pair[0] == letiable) {
      return pair[1];
    }
  }
  return false;
}

function drawPlayer() {
  // console.log(`${playerPos.x} ${playerPos.y} ${playerPos.r}`);
  playerCtx.clearRect(0, 0, 400, 400);
  playerCtx.fillStyle = "#66CCFF";
  playerCtx.save();
  playerCtx.translate((playerPos.x - 80) * scale, (playerPos.y - 80) * scale);
  playerCtx.rotate(Math.PI - playerPos.r);
  playerCtx.beginPath();
  // playerCtx.scale(1, -1);
  // playerCtx.translate(0, -height);
  playerCtx.arc(0, 0, 6, 0, Math.PI * 2);
  // playerCtx.arc(playerPos.x, playerPos.x, 6, 0, Math.PI * 2);
  playerCtx.closePath();
  playerCtx.fill();

  playerCtx.beginPath();
  playerCtx.moveTo(0, -12);
  playerCtx.lineTo(-6, 0);
  playerCtx.lineTo(6, 0);
  playerCtx.closePath();
  playerCtx.fill();

  playerCtx.globalCompositeOperation = "destination-out";
  playerCtx.beginPath();
  playerCtx.arc(0, 0, 3, 0, Math.PI * 2);
  playerCtx.closePath();
  playerCtx.fill();
  playerCtx.restore();
}

function clear() {
  console.log("[Zodiark] Canvas clear!");
  isClockwise = 0;
  ctx.clearRect(0, 0, size, size);
  zooCtx.clearRect(0, 0, size, size);
  playerCtx.clearRect(0, 0, size, size);
  fireCtx.clearRect(0, 0, size, size);
  pythonsCtx.clearRect(0, 0, size, size);
  Hide(true);
}

function draw() {
  if (!hide) {
    // if (zoneID != ZoneId.TheMinstrelsBalladZodiarksFall)
    //   return;
    // isClockwise = 1;
    ctx.save();
    ctx.clearRect(0, 0, size, size);
    ctx.globalCompositeOperation = "destination-over";
    ctx.translate(0, 0);
    ctx.drawImage(player, 0, 0);
    ctx.drawImage(fire, 0, 0);
    ctx.translate(zoo.width / 2, zoo.height / 2);
    ctx.rotate(((90 * Math.PI) / 180) * isClockwise);
    ctx.drawImage(zoo, -zoo.width / 2, -zoo.height / 2);

    // ctx.translate(pythons.width / 2, pythons.height / 2);
    // ctx.rotate(((90 * Math.PI) / 180) * isClockwise);
    // ctx.drawImage(pythons, -pythons.width / 2, -pythons.height / 2);

    ctx.restore();
  }
  window.requestAnimationFrame(draw);
}

function drawZoo(param: number) {
  switch (param) {
    // 贝希摩斯
    case 0x09: // 左上
      drawBehemoth(Loc.L, Loc.T);
      break;
    case 0x0a: // 右上
      drawBehemoth(Loc.R, Loc.T);
      break;
    case 0x0b: // 左下
      drawBehemoth(Loc.L, Loc.B);
      break;
    case 0x0c: // 右下
      drawBehemoth(Loc.R, Loc.B);
      break;
    // 鸟
    case 0x15: // 左上
      drawQuetzalcoatl(Loc.L, Loc.T);
      break;
    case 0x16: // 右上
      drawQuetzalcoatl(Loc.R, Loc.T);
      break;
    case 0x17: // 左下
      drawQuetzalcoatl(Loc.L, Loc.B);
      break;
    case 0x18: // 右下
      drawQuetzalcoatl(Loc.R, Loc.B);
      break;
    // 蛇
    case 0x0d: // 左半场
    case 0x0f:
      drawPythons(Loc.L);
      break;
    case 0x10: // 右半场
    case 0x0e:
      drawPythons(Loc.R);
      break;
    case 0x11: // 上半场
    case 0x13:
      drawPythons(Loc.T);
      break;
    case 0x12: // 下半场
    case 0x14:
      drawPythons(Loc.B);
      break;
    default:
      console.log(`Ukn param: ${param}`);
  }
}

function Hide(isHide: boolean) {
  hide = isHide;
  if (verbose) console.log(`Hide=${hide}`);
  if (isHide) {
    document.getElementById("field")!.style.background = `rgba(82, 82, 82,0)`;
  } else {
    document.getElementById(
      "field"
    )!.style.background = `rgba(82, 82, 82,${transparence})`;
  }
}

function OnPlayerChange(e: Parameters<EventMap["onPlayerChangedEvent"]>[0]) {
  if (hide) return;
  playerPos.x = e.detail.pos.x;
  playerPos.y = e.detail.pos.y;
  playerPos.r = e.detail.rotation;
  drawPlayer();
  // let z = e.detail.pos.z;
  // let playerRotation = e.detail.rotation;
}

function OnMapEffect(e: Parameters<EventMap["onMapEffectEvent"]>[0]) {
  if (zoneID != ZoneID.TheMinstrelsBalladZodiarksFall) return;
  switch (e.detail.parm2) {
    case 0x0020_0010:
      Hide(false);
      drawZoo(e.detail.parm3);
      setTimeout(clear, 30000);
      break;
    case 0x0002_0001: // /
      if ((e.detail.parm3 & 0xff) == 5) {
        drawFires(isClockwise == 1);
      }
      break;
    case 0x0040_0020: // \
      if ((e.detail.parm3 & 0xff) == 5) {
        drawFires(isClockwise == -1);
      }
      break;
    default:
      break;
    // console.log(`Ukn param: ${e.detail.parm2}`);
  }
}

function OnNetLog(e: EventResponses["LogLine"]): void {
  if (zoneID != ZoneID.TheMinstrelsBalladZodiarksFall) return;
  const type = e.line[0];
  if (type === logDefinitions.StartsUsing.type) {
    const skill = e.line[4];
    switch (skill) {
      case "6662":
        isClockwise = 1;
        // setTimeout(clear, 8000)
        break;
      case "6663":
        isClockwise = -1;
        // setTimeout(clear, 8000)
        break;
      // default:
      //   console.log(skill);
    }
  }
}

function OnChangeZone(e: Parameters<EventMap["ChangeZone"]>[0]) {
  zoneID = e.zoneID;
  Hide(zoneID != ZoneID.TheMinstrelsBalladZodiarksFall);

  // if (debug) {
  //   Hide(false);
  // }
  // if (hide && debug) {
  //   document.getElementById(
  //     "field"
  //   )!.style.background = `rgba(82, 82, 82,${transparence})`;
  // }
}

addOverlayListener("onMapEffectEvent", (e) => {
  // console.log(e.detail);
  OnMapEffect(e);
});

addOverlayListener("onPlayerChangedEvent", (e) => {
  OnPlayerChange(e);
});

addOverlayListener("ChangeZone", (e) => {
  OnChangeZone(e);
});

addOverlayListener("LogLine", (e) => {
  OnNetLog(e);
});

if (typeof document !== "undefined") {
  // This event comes early and is not cached, so set up event listener immediately.
  document.addEventListener("onOverlayStateUpdate", (e) => {
    // console.log(e.detail.isLocked);
    const docClassList = document.documentElement.classList;
    Hide(e.detail.isLocked);
    if (e.detail.isLocked) {
      clear();
      docClassList.remove("resizeHandle", "unlocked");
    } else {
      docClassList.add("resizeHandle", "unlocked");
      showExample();
    }
  });
}

function addUnlockText() {
  const unlockText = {
    en: "🔓 Unlocked (lock overlay before using)",
    de: "🔓 Entsperrt (Sperre das Overlay vor der Nutzung)",
    fr: "🔓 Débloqué (Bloquez l'overlay avant utilisation)",
    ja: "🔓 ロック解除 (オーバーレイを使用する前にロックしてください)",
    cn: "🔓 已解除锁定 (你需要将此悬浮窗锁定后方可使用)",
    ko: "🔓 위치 잠금 해제됨 (사용하기 전에 위치 잠금을 설정하세요)",
  };

  const id = "cactbot-unlocked-text";
  let textElem = document.getElementById(id);
  if (!textElem) {
    textElem = document.createElement("div");
    textElem.id = id;
    textElem.classList.add("text");
    // Set element display to none in case the page has not included defaults.css.
    textElem.style.display = "none";
    document.body.append(textElem);
  }
  textElem.innerHTML = unlockText["cn"];
}
// addOverlayListener("onLogEvent", (e) => {
//   e.detail.logs.forEach((log) => {
//     // Match "/echo tts:<stuff>"
//     // console.log(log);
//     const r = /00:0038::clearPic/.exec(log);
//     if (r) {
//       console.log("clearPic");
//       clear();
//     }

//     const r1 = /00:0038::picr/.exec(log);
//     if (r1) {
//       console.log("right");
//       isClockwise = 1;
//     }

//     const r2 = /00:0038::picl/.exec(log);
//     if (r2) {
//       console.log("left");
//       isClockwise = -1;
//     }
//   });
// });
