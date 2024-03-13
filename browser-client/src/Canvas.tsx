import { createEffect, createSignal } from "solid-js";
import styles from "./Canvas.module.css";
import { Cell } from "./models/cell";
import { GameState } from "./models/gameStateMessage";

const canvas_id = "canvas";
const cls = styles.center; //{border: "1px solid #AAA"}

let ref: any = null;
let rect: any = null;

const [pos, setPos] = createSignal({ x: 0, y: 0 });
const handleMouseMove = (
  event: any,
  owner: number | null,
  gameState: GameState
) => {
  ref = document.getElementById(canvas_id);
  rect = ref != null ? ref.getBoundingClientRect() : null;
  const ctx = ref.getContext("2d");
  setPos({
    x: event.clientX - rect.x,
    y: event.clientY - rect.y,
  });

  const marked = markState();
  if (marked) {
    const match = findCellUnderCursor(gameState.cells);
    if (
      match &&
      match.owner === owner &&
      !marked.marked.find((m) => m == match.id)
    ) {
      setMarkState({ marked: [...marked.marked, match.id] });
    }
  }
};

const [markState, setMarkState] = createSignal<{
  marked: number[];
} | null>(null);
const handleMouseDown = (
  event: any,
  owner: number | null,
  gameState: GameState
) => {
  if (owner === null) return;

  const match = findCellUnderCursor(gameState.cells);
  if (match && match.owner === owner) {
    setMarkState({ marked: [match.id] });
  } else {
    setMarkState(null);
  }
};

const handleMouseUp = (
  event: any,
  gameState: GameState,
  sendUnits: (sourceIds: number[], targetId: number) => void
) => {
  const marked = markState();
  if (marked === null) return;

  const match = findCellUnderCursor(gameState.cells);

  if (match) {
    sendUnits(marked.marked, match.id);
  }

  setMarkState(null);
};

const findCellUnderCursor = (cells: Cell[]) => {
  const cursor = pos();
  const match = cells.find(
    (c) =>
      (c.center[0] - cursor.x) * (c.center[0] - cursor.x) +
        (c.center[1] - cursor.y) * (c.center[1] - cursor.y) <=
      c.radius * c.radius
  );

  return match;
};

const clear = (w: number, h: number, context: CanvasRenderingContext2D) => {
  context.fillStyle = "white";
  context.fillRect(0, 0, w, h);
};

const colors = ["blue", "yellow", "green", "red"];
const getPlayerColor = (id: number | null) => {
  if (id === null) {
    return "grey";
  }
  if (id < 0 || id > colors.length) {
    return "black";
  } else {
    return colors[id];
  }
};

const drawCircle = (
  x: number,
  y: number,
  radius: number,
  color: string,
  border: number,
  context: CanvasRenderingContext2D
) => {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = border;
  context.strokeStyle = "#003300";
  context.stroke();
};

const drawUnits = (
  x: number,
  y: number,
  units: number,
  context: CanvasRenderingContext2D
) => {
  context.font = "14px serif";
  context.fillStyle = "black";
  context.fillText(units.toString(), x, y);
};

export const Canvas = (props: {
  width: number;
  height: number;
  sendUnits: (sourceIds: number[], targetId: number) => void;
  gameState: GameState;
  owner: number | null;
}) => {
  createEffect(() => {
    ref = document.getElementById(canvas_id);
    const context = ref.getContext("2d");
    rect = ref != null ? ref.getBoundingClientRect() : null;
    clear(rect.width, rect.height, context);

    const marked = markState();
    props.gameState.cells.forEach((c) => {
      const isMarked = marked?.marked.find((m) => m === c.id) !== undefined;
      drawCircle(
        c.center[0],
        c.center[1],
        c.radius,
        getPlayerColor(c.owner),
        isMarked ? 5 : 1,
        context
      );
      drawUnits(c.center[0], c.center[1], c.units, context);
    });
    props.gameState.bubbles.forEach((b) => {
      drawCircle(
        b.center[0],
        b.center[1],
        b.radius,
        getPlayerColor(b.owner),
        1,
        context
      );
      drawUnits(b.center[0], b.center[1], b.units, context);
    });
  });

  return (
    <>
      <canvas
        id={canvas_id}
        width={props.width}
        height={props.height}
        class={cls}
        onMouseMove={(evt) =>
          handleMouseMove(evt, props.owner, props.gameState)
        }
        onMouseDown={(evt) =>
          handleMouseDown(evt, props.owner, props.gameState)
        }
        onMouseUp={(evt) =>
          handleMouseUp(evt, props.gameState, props.sendUnits)
        }
        onMouseLeave={(_) => {
          setMarkState(null);
        }}
      />
      <br />
      x: {pos().x}, y: {pos().y}
    </>
  );
};
