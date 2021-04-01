const SCOPE = "world";
const PROGRESS_KEY = "taskProgress";
const TILE_ID_KEY = "dramaticTaskID";
const TASK_DIFFICULTY_KEY = "taskDifficulty";
const TASK_LENGTH_KEY = "taskLength";
const TASK_ROUNDS_LEFT_KEY = "roundsLeft";

const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";
const COMPLICATION_ID = "complication";
const COMPLICATION_LIGHT_ID = "complication";
const PIP_ID = "pip";
const PIP_LIGHT_ID = "pipLight";
const COUNTDOWN_ID = "countdown";


let tiles = [];
let lights = [];

// Dramatic Task frame
let dramaticTask = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === DRAMATIC_TASK_CONTAINER_ID)
if (dramaticTask === undefined) {
	return;
}
tiles.push(dramaticTask);

// Countdown
tiles.push(canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COUNTDOWN_ID));

// Complication
tiles.push(canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COMPLICATION_ID));

lights.push(canvas.lighting.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COMPLICATION_LIGHT_ID))

// Pips and lights1
let difficulty = dramaticTask.data.flags[SCOPE][TASK_DIFFICULTY_KEY];
for (let i = 0; i < difficulty; i++) {
	tiles.push(canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_ID + (i+1)));
}
for (let i = 0; i < difficulty; i++) {
	lights.push(canvas.lighting.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_LIGHT_ID + (i+1)));
}


let updates = tiles.map(e => {return e.id });
console.log(updates);
await canvas.tiles.deleteMany(updates);

updates = lights.map(e => {return e.id });
console.log(updates);
await canvas.lighting.deleteMany(updates);