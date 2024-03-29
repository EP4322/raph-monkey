import { todaysDate, todaysDateAll, wordleValidGuess } from 'src/app';
import { Guess, LeaderBoard } from 'src/types';

import { countCharacterOccurrence } from '../CheckingInput/checkInput';
import { findWordOfTheDay } from '../DynamoDB/DailyWord/getDailyWord';
import { getGuesses, storeGuess } from '../DynamoDB/Guess/guess';
import { storeScore } from '../DynamoDB/LeaderBoard/scoring';

export const wordleReturn = async (guess: string, user: string) => {
  if (!(await wordleValidGuess(guess))) {
    const uiOutput = 'Not a valid guess';
    const previousGuessesUi = '';
    return { uiOutput, previousGuessesUi };
  }

  const pastGuesses = await getGuesses(user, todaysDate);
  if (
    pastGuesses.length > 1 &&
    pastGuesses[pastGuesses.length - 1].guessNumber === 666
  ) {
    return {
      uiOutput: pastGuesses[pastGuesses.length - 1].uiOutput,
      previousGuessesUi: '',
    };
  }

  let previousGuessesUi = '';
  for (let i = 0; i < pastGuesses.length; i++) {
    previousGuessesUi += pastGuesses[i].uiOutput.concat('\n \n');
  }

  const targetWord = await findWordOfTheDay();
  const targetCharacters = countCharacterOccurrence(targetWord);

  const incorrect = ':wordle-grey-';
  const defaultResponse = [
    incorrect.concat(guess[0], ': '),
    incorrect.concat(guess[1], ': '),
    incorrect.concat(guess[2], ': '),
    incorrect.concat(guess[3], ': '),
    incorrect.concat(guess[4], ': '),
  ];

  let uiOutput = '';
  let correctLetter = '';

  for (let i = 0; i < 5; i++) {
    if (targetWord[i] === guess[i]) {
      defaultResponse[i] = ':wordle-green-'.concat(guess[i], ': ');
      correctLetter += guess[i];
    }
  }

  for (let i = 0; i < 5; i++) {
    if (targetWord.includes(guess[i])) {
      if (!correctLetter.includes(guess[i])) {
        defaultResponse[i] = ':wordle-yellow-'.concat(guess[i], ': ');
        correctLetter += guess[i];
      } else if (targetCharacters[guess[i]] > 1 && targetWord[i] !== guess[i]) {
        defaultResponse[i] = ':wordle-yellow-'.concat(guess[i], ': ');
        correctLetter += guess[i];
        targetCharacters[guess[i]] = targetCharacters[guess[i]] - 1;
      }
    }
    uiOutput += defaultResponse[i];
  }

  const currentGuessNumber = pastGuesses.length + 1;

  if (currentGuessNumber > 6) {
    uiOutput = `Guess limit has already been reached. Todays word was: ${targetWord}`;
    return { uiOutput, previousGuessesUi };
  }

  if (currentGuessNumber === 6 && guess !== targetWord) {
    uiOutput = `Guess limit has already been reached. Todays word was: ${targetWord}`;
    return { uiOutput, previousGuessesUi };
  }

  const guessStoring: Guess = {
    user,
    timeStamp: todaysDateAll().toISOString(),
    guessNumber: currentGuessNumber,
    guess,
    uiOutput,
  };

  await storeGuess(guessStoring);

  let timeDifference = 0;
  let score = 0;
  if (guess === targetWord) {
    if (currentGuessNumber !== 1) {
      const start = new Date(pastGuesses[0].timeStamp).getTime();
      const end = new Date(guessStoring.timeStamp).getTime();
      timeDifference = Math.round((end - start) / 1000);
      score = Math.round(
        guessStoring.guessNumber * 50 - 50 + timeDifference * 3,
      );
    }

    uiOutput += `\n \n :tada: Correct in ${currentGuessNumber} attempts \n \n :clock1: of ${timeDifference} s \n \n Your score is: ${score}`;

    const stopGuessingFlag: Guess = {
      user,
      timeStamp: todaysDateAll().toISOString(),
      guessNumber: 666,
      guess: 'Stop Flag',
      uiOutput: 'You already have completed todays RaphMonkey Wordle',
    };

    const leaderBoardStore: LeaderBoard = {
      user: 'LeaderBoard',
      timeStamp: todaysDateAll().toISOString(),
      score,
      leaderName: user,
      targetWord,
    };

    await storeGuess(stopGuessingFlag);
    await storeScore(leaderBoardStore);
  }
  return { uiOutput, previousGuessesUi };
};
