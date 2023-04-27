import { getScores } from './scoring';

export const listOfLeaders = async () => {
  // console.log('Getting leaders');
  const todaysDateAll = new Date();
  const todaysDate = todaysDateAll.toISOString().split('T')[0];
  const todaysScores = await getScores('LeaderBoard', todaysDate);
  const orderedScores = todaysScores.sort((a, b) => a.score - b.score);
  // console.log(orderedScores);

  let uiOutput = `:first_place_medal: Todays Leader Board - ${todaysDate} \n \n`;
  for (let i = 0; i < orderedScores.length; i++) {
    uiOutput += (i + 1)
      .toString()
      .concat(
        '. ',
        orderedScores[i].leaderName,
        ': ',
        orderedScores[i].score.toString(),
        '\n \n',
      );
  }

  return uiOutput;
};
