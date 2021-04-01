const SCOPE = "world";
const TILE_ID_KEY = "dramaticTaskID";
const COMPLICATION_ID = "complication";
const COMPLICATION_LIGHT_ID = "complication";
const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";

let dramaticTask = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === DRAMATIC_TASK_CONTAINER_ID);

if (dramaticTask === undefined) {
	// add error toast
	ui.notifications.error("No Dramatic Task underway!");
	return;
}

// Find the complication image and toggle it
let complication = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COMPLICATION_ID);
let complicationLight = canvas.lighting.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COMPLICATION_LIGHT_ID);

let isHidden = !complication.data.hidden;

await complication.update({hidden:isHidden});
await complicationLight.update({hidden:isHidden});
