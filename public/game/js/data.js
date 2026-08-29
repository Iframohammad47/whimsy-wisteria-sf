/* =========================================================
   WHIMSY WISTERIA — Story & Game Data
   All narrative content lives here, separate from game logic.
   ========================================================= */

const INTRO_LINES = [
  "Oh — a visitor. How lovely. The wisteria always knows before I do.",
  "Welcome to the garden. I am the one who keeps it, though truthfully it keeps me.",
  "People come here carrying letters they never sent, and words they never quite found.",
  "So we make bouquets instead. Flowers say the things we cannot.",
  "Stay a while. There are a few letters waiting, and a garden eager to be gathered.",
];

const ENDING_LINES = [
  "You gathered gently, and you listened. That is rarer than you'd think.",
  "The letters are answered now — in petals, in stems, in the quiet between words.",
  "The wisteria will keep swaying whether or not anyone is watching. But it is sweeter when someone is.",
  "Thank you for tending this small corner of the world with me.",
  "Come back whenever the days grow loud. The garden will be here, breathing.",
];

/* Flower catalogue — the meaning belongs to the flower type. */
const FLOWERS = {
  rose: {
    id: "rose",
    name: "Rose",
    meaning: "remembrance",
    image: "assets/flowers/rose.png",
    maxQuantity: 5,
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    meaning: "warmth held toward the light",
    image: "assets/flowers/sunflower.png",
    maxQuantity: 5,
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    meaning: "calm, and gentle devotion",
    image: "assets/flowers/lavender.png",
    maxQuantity: 5,
  },
};

/* Each stage: an intro line from the keeper, a letter, the flowers
   present (with scattered positions), and a response builder. */
const STAGES = [
  {
    number: 1,
    intro: [
      "The first letter is soft-spoken. It only asks to be remembered.",
    ],
    occasion: "For someone who is far away",
    letter: [
      "To whoever tends the garden today,",
      "It has been a long season since I last sat beneath the wisteria. I find I miss the small things most — the light on the path, the hush before evening.",
      "Would you gather something for a friend I cannot reach? Nothing grand. Only enough to say: I still think of you, quietly, often.",
      "With warmth,",
      "— A letter left on the bench",
    ],
    flowers: [
      { id: "rose", left: 24, top: 58 },
      { id: "sunflower", left: 50, top: 69 },
      { id: "lavender", left: 73, top: 52 },
    ],
    responseFor: function (bouquet) {
      const lines = [
        "Ah. You listened for what the letter needed, not just what it said.",
      ];
      const counts = countBouquet(bouquet);
      if (counts.rose > 0) {
        lines.push(
          "Roses — for remembrance. A quiet way of saying you were never truly forgotten."
        );
      }
      if (counts.lavender > 0) {
        lines.push(
          "And lavender, for calm. Distance is easier to bear when it smells of something gentle."
        );
      }
      if (counts.sunflower > 0) {
        lines.push(
          "The sunflowers turn toward whoever reads this. Warmth travels farther than we think."
        );
      }
      lines.push(
        "I'll set this on the bench where the letter waited. Someone, somewhere, will feel a little less far."
      );
      return lines;
    },
  },
  {
    number: 2,
    intro: [
      "The second letter is heavier in the hand. Grief, I think — the loving kind.",
    ],
    occasion: "In memory of a gentle soul",
    letter: [
      "Dear keeper of quiet things,",
      "There was someone who used to walk this garden with me. They knew every flower by its old, forgotten name.",
      "They are gone now, but the paths still remember their footsteps. I come here to remember with them.",
      "Please make a bouquet worthy of a goodbye that never quite finishes. Something tender. Something that stays.",
      "— Written beneath the arbor",
    ],
    flowers: [
      { id: "rose", left: 20, top: 55 },
      { id: "lavender", left: 42, top: 66 },
      { id: "rose", left: 66, top: 60 },
      { id: "sunflower", left: 80, top: 50 },
    ],
    responseFor: function (bouquet) {
      const lines = [
        "Yes. This one asked for care, and you gave it care.",
      ];
      const counts = countBouquet(bouquet);
      if (counts.rose >= 2) {
        lines.push(
          "So many roses. Remembrance layered upon remembrance — the way we hold the people we've lost."
        );
      } else if (counts.rose > 0) {
        lines.push(
          "A rose for remembrance. One is enough, when it is meant."
        );
      }
      if (counts.lavender > 0) {
        lines.push(
          "Lavender to soften the ache. Grief and calm can share the same vase, you know."
        );
      }
      if (counts.sunflower > 0) {
        lines.push(
          "And a little sunlight, so the goodbye isn't only shadow. They would have liked that."
        );
      }
      lines.push(
        "We'll lay it beneath the arbor, where the footsteps are loudest. Some farewells are kept, not finished."
      );
      return lines;
    },
  },
  {
    number: 3,
    intro: [
      "The last letter is the brightest. It hardly needs answering — but joy likes company.",
    ],
    occasion: "A small, ordinary celebration",
    letter: [
      "To the gardener with the patient hands,",
      "Nothing is wrong today. That, I think, is the miracle worth marking.",
      "The sun came up, the kettle sang, and I remembered to be glad. I'd like to give that gladness a shape.",
      "Make me something cheerful — a bouquet that grins a little. For no reason at all, which is the very best reason.",
      "— Slipped under the gate at dawn",
    ],
    flowers: [
      { id: "sunflower", left: 22, top: 60 },
      { id: "rose", left: 40, top: 52 },
      { id: "sunflower", left: 58, top: 67 },
      { id: "lavender", left: 76, top: 55 },
    ],
    responseFor: function (bouquet) {
      const lines = [
        "There it is — a bouquet that grins. I can feel the letter smiling back.",
      ];
      const counts = countBouquet(bouquet);
      if (counts.sunflower >= 2) {
        lines.push(
          "Sunflowers upon sunflowers. Warmth held toward the light, gathered by the armful."
        );
      } else if (counts.sunflower > 0) {
        lines.push(
          "A sunflower for the ordinary miracle of a good morning."
        );
      }
      if (counts.rose > 0) {
        lines.push(
          "A rose to remember this small gladness by — the plain days deserve keeping too."
        );
      }
      if (counts.lavender > 0) {
        lines.push(
          "And lavender, so the joy stays soft and doesn't burn itself out."
        );
      }
      lines.push(
        "I'll tuck it by the gate at dawn. Whoever finds it will be reminded that nothing wrong is its own quiet wonder."
      );
      return lines;
    },
  },
];

/* Helper: tally a bouquet array of flower ids into counts. */
function countBouquet(bouquet) {
  const counts = { rose: 0, sunflower: 0, lavender: 0 };
  bouquet.forEach(function (id) {
    if (counts[id] === undefined) counts[id] = 0;
    counts[id] += 1;
  });
  return counts;
}
