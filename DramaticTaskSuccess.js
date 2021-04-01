const SCOPE = "world";
const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";
const TILE_ID_KEY = "dramaticTaskID";
const PROGRESS_KEY = "taskProgress";
const TASK_DIFFICULTY_KEY = "taskDifficulty";
const PIP_ID = "pip";
const PIP_LIGHT_ID = "pipLight";
const TASK_ROUNDS_LEFT_KEY = "roundsLeft";

let dramaticTask = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === DRAMATIC_TASK_CONTAINER_ID);

if (dramaticTask === undefined) {
	// add error toast
	ui.notifications.error("No Dramatic Task underway!");
	return;
}

let progress = dramaticTask.data.flags[SCOPE][PROGRESS_KEY];
let difficulty = dramaticTask.data.flags[SCOPE][TASK_DIFFICULTY_KEY];
let roundsLeft = dramaticTask.data.flags[TASK_ROUNDS_LEFT_KEY];

if (roundsLeft <= 0) {
	ui.notifications.warn("Dramatic task already ended!");
	return;
}
	
	// We win! Set all pips to green and play some kind of nice jingle!
for (let i = 0; i < progress; i++) {
	let pip = canvas.tiles.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_ID + (i +1));
	await pip.update({
		"img": "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/pip_green.png"
	});
	// Find the matching light to enable and green-ify! 
	let light = canvas.lighting.placeables.find(x => x.data.flags[SCOPE] !== undefined && x.data.flags[SCOPE][TILE_ID_KEY] === PIP_LIGHT_ID + (i +1));
	await light.update({
		"hidden": false,
		tintColor: "#11ff22",
	});
}