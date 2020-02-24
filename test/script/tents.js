/* tents.js */

ui.debug.addDebugData("tents", {
	url: "5/5/2g01k1hbi36bjbbg",
	failcheck: [
		[
			"nmTreeNone",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . . 1 . . /. A . . 3 1 /. . 1 . A . /. . . . 1 . /1 A 1 . . . /"
		],
		[
			"nmTentNone",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . . 1 . . /. . . . 3 1 /. A 1 . . . /. . . . 1 . /1 A 1 . . . /"
		],
		[
			"tentAround",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . A 1 . . /. . . . 3 1 /. . 1 . A A /. . A . 1 . /1 A 1 . . . /"
		],
		[
			"exTentNe",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . . 1 A . /. . A . 3 1 /. . 1 . . A /. . A . 1 . /1 . 1 . A . /"
		],
		[
			"nmTentLt",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . A 1 . . /. . . . 3 1 /. . 1 . . A /. . A . 1 . /1 . 1 . A . /"
		],
		[
			"nmTentGt",
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . A 1 . A /. . . . 3 1 /. A 1 . A . /. . . . 1 . /1 A 1 A . . /"
		],
		[
			null,
			"pzprv3/tents/5/5/. 2 . 0 1 . /. . A 1 . A /. . . . 3 1 /. A 1 . A . /. . . . 1 . /1 A 1 . . . /0 -1 0 0 /0 0 0 0 /-1 0 0 0 /0 0 0 0 /-1 0 0 0 /0 0 0 0 -1 /0 0 0 0 0 /0 0 0 -1 0 /0 0 0 0 0 /"
		]
	],
	inputs: [
		{
			input: ["newboard,3,2"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. . . . /0 0 /0 0 /0 0 0 /"
		},
		{
			input: ["editmode,mark-tree", "mouse,left,3,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. . 1 . /0 0 /0 0 /0 0 0 /"
		},

		{
			label: "Place no more than 1 tent per drag",
			input: ["playmode,auto", "mouse,left,1,3,1,1"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. A 1 . /0 0 /0 0 /0 0 0 /"
		},

		{
			label: "Drag from an existing tent to a tree to add a line",
			input: ["mouse,left,1,3,3,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. A 1 . /0 0 /-1 0 /0 0 0 /"
		},

		{
			label: "Drag again to remove only the line",
			input: ["mouse,left,1,3,3,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. A 1 . /0 0 /0 0 /0 0 0 /"
		},

		{
			label: "Drag from a tree to an empty space to place a tent and a line",
			input: ["mouse,left,3,3,5,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. A 1 A /0 0 /0 -1 /0 0 0 /"
		},

		{
			label: "Right-click to overwrite tent with dot",
			input: ["mouse,right,5,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. A 1 - /0 0 /0 -1 /0 0 0 /"
		},

		{
			label:
				"Drag from a tree to a dot to erase the line, and continue with more dots",
			input: ["mouse,left,3,3,5,3,5,1"],
			result: "pzprv3/tents/2/3/. . . . /. . . - /. A 1 - /0 0 /0 0 /0 0 0 /"
		},

		{
			label: "Drag from a dot to a tree to add more dots",
			input: ["mouse,left,5,3,3,3,3,1"],
			result: "pzprv3/tents/2/3/. . . . /. . - - /. A 1 - /0 0 /0 0 /0 0 0 /"
		},

		{
			label:
				"Only place lines on borders adjacent to trees, ignore other borders",
			input: ["ansclear", "playmode,subline", "mouse,left,1,1,3,1,3,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. . 1 . /0 0 /0 0 /0 -1 0 /"
		},

		{
			label: "Drag from an empty space to a tree to remove the line",
			input: ["playmode,auto", "mouse,left,3,1,3,3"],
			result: "pzprv3/tents/2/3/. . . . /. . . . /. . 1 . /0 0 /0 0 /0 0 0 /"
		}
	]
});