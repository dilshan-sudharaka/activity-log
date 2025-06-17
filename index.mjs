import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const git = simpleGit();

const startDate = moment("2023-01-01");
const endDate = moment("2023-12-31");
const totalDays = endDate.diff(startDate, "days") + 1;

const usedDays = new Set();

// Helper to pick random unique days
const pickDays = (count) => {
  const days = new Set();
  while (days.size < count) {
    const day = random.int(0, totalDays - 1);
    if (!usedDays.has(day)) {
      days.add(day);
      usedDays.add(day);
    }
  }
  return [...days];
};

// Step 1: Assign commit levels
const daysLow = pickDays(80).map(day => ({ dayOffset: day, count: 1 }));
const daysMedium = pickDays(30).map(day => ({ dayOffset: day, count: random.int(2, 3) }));
const daysHigh = pickDays(30).map(day => ({ dayOffset: day, count: random.int(4, 6) }));
const daysVeryHigh = pickDays(15).map(day => ({ dayOffset: day, count: random.int(7, 12) }));

const allCommitDays = [...daysLow, ...daysMedium, ...daysHigh, ...daysVeryHigh];

// Sort chronologically
allCommitDays.sort((a, b) => a.dayOffset - b.dayOffset);

// Commit loop
const makeCommits = async (dayIndex = 0, commitIndex = 0) => {
  if (dayIndex >= allCommitDays.length) {
    console.log("✅ All commits created.");
    await git.push();
    return;
  }

  const { dayOffset, count } = allCommitDays[dayIndex];
  const commitDate = startDate.clone().add(dayOffset, "days").add(random.int(8, 20), "hours");

  const data = { date: commitDate.format() };
  console.log(`📅 ${commitDate.format()} - commit ${commitIndex + 1}/${count}`);

  jsonfile.writeFile(path, data, async () => {
    await git.add([path]);
    await git.commit(`Commit on ${commitDate.format("YYYY-MM-DD HH:mm")}`, {
      "--date": commitDate.format()
    });

    if (commitIndex + 1 < count) {
      makeCommits(dayIndex, commitIndex + 1); // same day, next commit
    } else {
      makeCommits(dayIndex + 1, 0); // move to next day
    }
  });
};


makeCommits();
