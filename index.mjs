import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const git = simpleGit();

const startDate = moment("2021-01-01");
const endDate = moment("2021-12-31");
const totalDays = endDate.diff(startDate, "days") + 1;

const commitDays = new Set();

// Pick 60 random days for normal commits
while (commitDays.size < 60) {
  const day = random.int(0, totalDays - 1);
  commitDays.add(day);
}

// Pick 5 more days for high-activity (distinct from normal)
const highActivityDays = new Set();
while (highActivityDays.size < 5) {
  const day = random.int(0, totalDays - 1);
  if (!commitDays.has(day)) {
    highActivityDays.add(day);
  }
}

const allCommitDays = [...commitDays].map(d => ({
  dayOffset: d,
  count: random.int(1, 2)
})).concat(
  [...highActivityDays].map(d => ({
    dayOffset: d,
    count: random.int(5, 10)
  }))
);

// Sort by date for realism
allCommitDays.sort((a, b) => a.dayOffset - b.dayOffset);

// Recursive function to commit
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
