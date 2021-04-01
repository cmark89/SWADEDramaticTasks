showDialog();

function showDialog() {
	let runTask = false;
	new Dialog({
	 title: "Dramatic Task",
	 content: `
	 <p>For one player, consider the following difficulties:</p>
	 <ul>
	 <li><strong>Challenging:</strong> 4 tokens in 3 rounds</li>
	 <li><strong>Difficult:</strong> 6 tokens in 4 rounds</li>
	 <li><strong>Complex:</strong> 8 tokens in 5 rounds</li>
	 </ul>
	 <p>For multiple players, tune accordingly. 1 success per player per round is a good starting point.</p>
	 <form>
		<div class="form-group">
			<label>Task Tokens: </label>
			<input type="number" id="dtDifficulty" name="dtDifficulty" value="4"></input>
		</div>
		
		<div class="form-group">
			<label>Rounds: </label>
			<select id="dtLength" name="dtLength">
				  <option value="3">3</option>
				  <option value="4">4</option>
				  <option value="5">5</option>
			</select>
		</div>
	 </form>
	 `,
	 buttons: {
	  start: {
	   icon: '<i class="fas fa-check"></i>',
	   label: "Start Dramatic Task",
	   callback: () => runTask = true
	  },
	  cancel: {
	   icon: '<i class="fas fa-times"></i>',
	   label: "Cancel",
	   callback: () => runTask = false
	  }
	 },
	 default: "cancel",
	 close: html => {
		 if (!runTask) {
			 return;
		 }
		 
		 console.log(html);
		 
		let taskDifficulty = html.find('[name="dtDifficulty"]')[0].value;
		let taskLength = html.find('[name="dtLength"]')[0].value;
		
		if (taskDifficulty <= 0 || taskDifficulty > 20) {
			ui.notifications.error("Task Tokens must be between 1 and 20 (inclusive)!");
			return;
		}
		
		startDramaticTask(parseInt(taskDifficulty), parseInt(taskLength));
	 }
	}).render(true);
}

// Start a dramatic task with the given difficulty and task length	// TODO: Move this to a module, this shouldn't be in a macro
async function startDramaticTask(taskDifficulty, taskLength) {
	const SCOPE = "world";
	const PROGRESS_KEY = "taskProgress";
	const TILE_ID_KEY = "dramaticTaskID";
	const TASK_DIFFICULTY_KEY = "taskDifficulty";
	const TASK_LENGTH_KEY = "taskLength";
	const TASK_ROUNDS_LEFT_KEY = "roundsLeft";

	const DRAMATIC_TASK_CONTAINER_ID = "dramaticTaskFrame";
	const PIP_ID = "pip";
	const PIP_LIGHT_ID = "pipLight";
	const COUNTDOWN_ID = "countdown";
	const COMPLICATION_ID = "complication";
	const COMPLICATION_LIGHT_ID = "complication";
	
	let initialProgress = 0;

	let FRAME_START_X = 1180;	// TODO: Have a window
	let FRAME_START_Y = 980;
	let FRAME_WIDTH = 583;
	let FRAME_HEIGHT = 140;

	let COUNTDOWN_WIDTH = 140;
	let COUNTDOWN_HEIGHT = 140;
	let COUNTDOWN_OFFSET_X = 500;
	let COUNTDOWN_OFFSET_Y = -60;

	let COMPLICATION_WIDTH = 111;
	let COMPLICATION_HEIGHT = 91;
	let COMPLICATION_OFFSET_X = -40;
	let COMPLICATION_OFFSET_Y = -60;

	// For each token we need to acquire, create a pip graphic.
	let MAX_PIPS_PER_LINE = 10;

	let PIP_HEIGHT = 48;
	let PIP_WIDTH = 48;

	let DRAWABLE_AREA_START_X = 99;
	let DRAWABLE_AREA_START_Y = 22;
	let DRAWABLE_WIDTH = 384;
	let DRAWABLE_HEIGHT = 96;



	// ----------PRELOAD ASSETS (and test if this actually does anything----------
	for (let i = 0; i <= 5; i++) {
		let preloadedTile = await Tile.create({
			img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/turnsLeft_" + i + ".png",
			width: COUNTDOWN_WIDTH,
			height: COUNTDOWN_HEIGHT,
			scale: 1,
			x: FRAME_START_X,
			y: FRAME_START_Y,
			z: 0,
			hidden: true,
			locked: true
		}).then(x => x.delete());
	}
	let colors = ["empty", "red", "yellow", "green"];
	for (let i = 0; i < colors.length; i++) {
		let preloadedPip = await Tile.create({
			img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/pip_" + colors[i] + ".png",
			width: PIP_WIDTH,
			height: PIP_HEIGHT,
			scale: 1,
			x: FRAME_START_X,
			y: FRAME_START_Y,
			z: 0,
			hidden: true,
			locked: true
		}).then(x => x.delete());
	}

	// PRELOADING DONE

	let instantiatedTiles = [];

	// Create the frame for the dramatic task!
	let dramaticTask = await Tile.create({
		img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/frame.png",
		width: FRAME_WIDTH,
		height: FRAME_HEIGHT,
		scale: 1,
		x: FRAME_START_X,
		y: FRAME_START_Y,
		z: 370,
		hidden: true,
		locked: true
	});

	// Initialize the tile with flags that store information on the dramatic task
	await dramaticTask.setFlag(SCOPE, TILE_ID_KEY, DRAMATIC_TASK_CONTAINER_ID);
	await dramaticTask.setFlag(SCOPE, TASK_DIFFICULTY_KEY, taskDifficulty);
	await dramaticTask.setFlag(SCOPE, TASK_LENGTH_KEY, taskLength);
	await dramaticTask.setFlag(SCOPE, PROGRESS_KEY, initialProgress);
	await dramaticTask.setFlag(SCOPE, TASK_ROUNDS_LEFT_KEY, taskLength);
	instantiatedTiles.push(dramaticTask);

	// Create the complication UI
	let complication = await Tile.create({
		img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/caution.png",
		width: COMPLICATION_WIDTH,
		height: COMPLICATION_HEIGHT,
		scale: 1,
		x: FRAME_START_X + COMPLICATION_OFFSET_X,
		y: FRAME_START_Y + COMPLICATION_OFFSET_Y,
		z: 372,
		hidden: true,
		locked: true
	});
	await complication.setFlag(SCOPE, TILE_ID_KEY, COMPLICATION_ID);

	let complicationLight = await AmbientLight.create({
		t: "l",
		x: FRAME_START_X + COMPLICATION_OFFSET_X + COMPLICATION_WIDTH / 2,
		y: FRAME_START_Y + COMPLICATION_OFFSET_Y + COMPLICATION_HEIGHT / 2,
		rotation: 0,
		dim: 1.1,
		bright: 0.5,
		angle: 360,
		tintColor: "#ff0000",
		hidden: true,
		tintAlpha: 0.9,
		lightAnimation: {
			type: "pulse",
			speed:5,
			intensity: 7
		}
	});
	await complicationLight.setFlag(SCOPE, TILE_ID_KEY, COMPLICATION_LIGHT_ID);

	// Complication light

	// Create the countdown UI
	let countdown = await Tile.create({
		img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/turnsLeft_" + taskLength + ".png",
		width: COUNTDOWN_WIDTH,
		height: COUNTDOWN_HEIGHT,
		scale: 1,
		x: FRAME_START_X + COUNTDOWN_OFFSET_X,
		y: FRAME_START_Y + COUNTDOWN_OFFSET_Y,
		z: 371,
		hidden: true,
		locked: true
	});
	await countdown.setFlag(SCOPE, TILE_ID_KEY, COUNTDOWN_ID);
	instantiatedTiles.push(countdown);


	let numberOfLines = Math.ceil(taskDifficulty / MAX_PIPS_PER_LINE);

	// TODO: We can make this much more efficient by having a function factory that takes our index number and then uses it to build the onComplete function, which we can then pass to the promise so the creation doesn't block
	let pipsInThisRow, xOffset, yOffset;
	for (let i = 0; i < taskDifficulty; i++) {
		if (numberOfLines > 1) {
			pipsInThisRow = i >= MAX_PIPS_PER_LINE ? taskDifficulty - MAX_PIPS_PER_LINE : MAX_PIPS_PER_LINE;
		} else {
			pipsInThisRow = taskDifficulty;
		}
		
		yOffset = numberOfLines === 1 ? (DRAWABLE_HEIGHT / 2) - (PIP_HEIGHT / 2)  : (PIP_HEIGHT * (Math.floor(i / MAX_PIPS_PER_LINE)));
		xOffset = (((i % MAX_PIPS_PER_LINE) + 1) * (DRAWABLE_WIDTH / (pipsInThisRow+1))) - (PIP_WIDTH / 2);
		
		// DRAW A TILE AT THIS POSITION
		let pip = await Tile.create({
			img: "https://assets.forge-vtt.com/5ee0cbafb296ee04a2d94977/assets/ui/dramaticTasks/pip_empty.png",
			width: PIP_WIDTH,
			height: PIP_HEIGHT,
			scale: 1,
			x: xOffset + DRAWABLE_AREA_START_X + FRAME_START_X,
			y: yOffset + DRAWABLE_AREA_START_Y + FRAME_START_Y,
			z: 380,
			hidden: true,
			locked: true
		});
		await pip.setFlag(SCOPE, TILE_ID_KEY, PIP_ID + (i+1));
		instantiatedTiles.push(pip);
		let light = await AmbientLight.create({
			t: "l",
			x: xOffset + DRAWABLE_AREA_START_X + FRAME_START_X + PIP_WIDTH / 2,
			y: yOffset + DRAWABLE_AREA_START_Y + FRAME_START_Y + PIP_HEIGHT / 2,
			rotation: 0,
			dim: 0.8,
			bright: 0.2,
			angle: 360,
			tintColor: "#ffcc00",
			hidden: true,
			tintAlpha: 0.5
			});
		await light.setFlag(SCOPE, TILE_ID_KEY, PIP_LIGHT_ID + (i+1));
	}

	instantiatedTiles.push(countdown);
	console.log(instantiatedTiles);
	let updates = instantiatedTiles.map(e => {return {_id: e.id, hidden: false}});
	canvas.tiles.updateMany(updates);
}