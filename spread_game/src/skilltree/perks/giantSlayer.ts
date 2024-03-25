import { formatDescription } from "../utils";
import { radiusToUnits } from "../../spreadGame/common";

import {
	AttachProps,
	TimedProps,
} from "../../spreadGame/mechanics/events/definitions";
import { BubbleFightProps } from "../../spreadGame/mechanics/events/fight";
import { CreatePerk, getPerkValue } from "./perk";
import {
	VisualizeBubbleProps,
	visualizeBubbleUtils,
} from "../../spreadGame/mechanics/events/visualizeBubbleProps";
import Cell from "../../spreadGame/cell";

const name = "GiantSlayer";
const defaultValue = 0;
const defaultValues = [5];

const calcAttackModifier = (cell: Cell, val: number): number => {
	const base_capacity = radiusToUnits(cell.radius);
	return (base_capacity * val) / 10;
};

export const GiantSlayerPerk: CreatePerk<number> = {
	name: name,
	createFromValues: (values = defaultValues) => {
		return {
			name: name,
			displayName: "Giant Slayer",
			values: values,
			defaultValue: defaultValue,
			description: (lvl) => "slay the big bois",
			triggers: [
				{
					type: "BeforeFightEvent",
					getValue: (
						trigger,
						game
					): AttachProps<TimedProps<BubbleFightProps>>[] => {
						const playerId = trigger.before.bubble.playerId;
						const val = getPerkValue(
							game,
							name,
							playerId,
							values,
							defaultValue
						);
						if (trigger.before.other.type !== "Cell" || val === defaultValue)
							return [];

						// otherwise modifiers could stack. better: remove modfier after fight.
						if (trigger.before.bubble.targetId !== trigger.before.other.val.id)
							return [];

						const attackModifier = calcAttackModifier(
							trigger.before.other.val,
							val
						);
						const bubbleProps: AttachProps<TimedProps<BubbleFightProps>> = {
							entity: {
								type: "Bubble",
								id: trigger.before.bubble.id,
							},
							perkName: name,
							triggerType: "BeforeFightEvent",
							props: {
								expirationInMs: "Never",
								value: {
									type: "BubbleFightProps",
									combatAbilityModifier: attackModifier,
								},
							},
						};
						return [bubbleProps];
					},
				},
				{
					type: "BeforeFightEvent",
					getValue: (
						trigger,
						game
					): AttachProps<TimedProps<VisualizeBubbleProps>>[] => {
						const val = getPerkValue(
							game,
							name,
							trigger.before.bubble.playerId,
							values,
							defaultValue
						);

						if (trigger.before.other.type !== "Cell" || val === defaultValue)
							return [];
						if (trigger.before.bubble.targetId !== trigger.before.other.val.id)
							return [];

						const attackModifier = calcAttackModifier(
							trigger.before.other.val,
							val
						);
						const visProps: AttachProps<TimedProps<VisualizeBubbleProps>> = {
							entity: {
								type: "Bubble",
								id: trigger.before.bubble.id,
							},
							perkName: name,
							triggerType: "BeforeFightEvent",
							props: {
								expirationInMs: "Never",
								value: {
									...visualizeBubbleUtils.default,
									combatAbilityModifier: attackModifier,
								},
							},
						};
						return [visProps];
					},
				},
			],
		};
	},
	replay: {
		gameSettings: { mechanics: "basic", updateFrequencyInMs: 25 },
		lengthInMs: 5000,
		map: {
			width: 500,
			height: 500,
			cells: [
				{
					id: 0,
					playerId: 0,
					position: [100, 100],
					radius: 32,
					units: 20,
				},
				{
					id: 1,
					playerId: 0,
					position: [100, 400],
					radius: 32,
					units: 20,
				},
				{
					id: 2,
					playerId: 1,
					position: [400, 100],
					radius: 25,
					units: 12,
				},
				{
					id: 3,
					playerId: 1,
					position: [400, 400],
					radius: 100,
					units: 9,
				},
			],
			players: 2,
		},
		moveHistory: [
			{
				timestamp: 0,
				data: {
					type: "sendunitsmove",
					data: {
						playerId: 0,
						senderIds: [0],
						receiverId: 2,
					},
				},
			},
			{
				timestamp: 0,
				data: {
					type: "sendunitsmove",
					data: {
						playerId: 0,
						senderIds: [1],
						receiverId: 3,
					},
				},
			},
		],
		perks: [
			{
				name: name,
				data: { type: "number", val: defaultValues },
			},
		],
		players: [
			{ id: 0, skills: [{ name: name, level: 1 }] },
			{ id: 1, skills: [] },
		],
	},
};
