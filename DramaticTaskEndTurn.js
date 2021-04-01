const SCOPE = "world";
const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";
const TILE_ID_KEY = "dramaticTaskID";
const PROGRESS_KEY = "taskProgress";
const TASK_DIFFICULTY_KEY = "taskDifficulty";
const PIP_ID = "pip";
const PIP_LIGHT_ID = "pipLight";
const TASK_LENGTH_KEY = "taskLength";
const TASK_ROUNDS_LEFT_KEY = "roundsLeft";
const COUNTDOWN_ID = "countdown";

let dramaticTask = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === DRAMATIC_TASK_CONTAINER_ID);

if (dramaticTask === undefined) {
	// add error toast
	ui.notifications.error("No Dramatic Task underway!");
	return;
}

let progress = dramaticTask.data.flags[SCOPE][PROGRESS_KEY];
let difficulty = dramaticTask.data.flags[SCOPE][TASK_DIFFICULTY_KEY];
let roundsLeft = dramaticTask.data.flags[SCOPE][TASK_ROUNDS_LEFT_KEY];

if (progress >= difficulty) {
	ui.notifications.warn("Dramatic task already completed!");
	return;
}

if (roundsLeft <= 0) {
	ui.notifications.warn("Dramatic task already over!");
	return;
}

roundsLeft--;
console.log("Turns left: " + roundsLeft);
await dramaticTask.setFlag(SCOPE, TASK_ROUNDS_LEFT_KEY, roundsLeft);

// Update the turns left counter
let countdown = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === COUNTDOWN_ID);

await countdown.update({
	"img": "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/turnsLeft_" + roundsLeft + ".png"
});