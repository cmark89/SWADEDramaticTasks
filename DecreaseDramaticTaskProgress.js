const SCOPE = "world";
const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";
const TILE_ID_KEY = "dramaticTaskID";
const PROGRESS_KEY = "taskProgress";
const TASK_DIFFICULTY_KEY = "taskDifficulty";
const PIP_ID = "pip";
const PIP_LIGHT_ID = "pipLight";

let dramaticTask = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === DRAMATIC_TASK_CONTAINER_ID);

if (dramaticTask === undefined) {
	// add error toast
	ui.notifications.error("No Dramatic Task underway!");
	return;
}

let progress = dramaticTask.data.flags[SCOPE][PROGRESS_KEY];
let difficulty = dramaticTask.data.flags[SCOPE][TASK_DIFFICULTY_KEY];

if (progress >= difficulty) {
	ui.notifications.warn("Dramatic task already completed!");
	return;
}
if (progress <= 0) {
	ui.notifications.warn("Dramatic task progress empty!");
	return;
}

progress = Math.max(0, progress - 1);
console.log("Current progress: " + progress + " / " + difficulty);
await dramaticTask.setFlag(SCOPE, PROGRESS_KEY, progress);

// Find the next pip to darken!
let pip = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_ID + (progress + 1));
await pip.update({
	"img": "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/pip_empty.png"
});


// Find the matching light to disable! 
let light = canvas.lighting.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_LIGHT_ID + (progress + 1));
await light.update({
	"hidden": true
});