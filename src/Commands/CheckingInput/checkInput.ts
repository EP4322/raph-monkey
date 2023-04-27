import { listOfLeaders } from '../DynamoDB/LeaderBoard/getLeader';
import { wordleReturn } from '../UiOutput/uiOutput';

export const checkInput = async (inputCommand: string, user: string) => {
  const splitInput = inputCommand.split(' ');
  if (
    splitInput[0] === 'guess' &&
    splitInput[1].length === 5 &&
    splitInput.length === 2
  ) {
    const { uiOutput, previousGuessesUi } = await wordleReturn(
      splitInput[1].toLowerCase(),
      user,
    );
    return {
      status: 200,
      result: previousGuessesUi.concat('`', splitInput[1], ':`', uiOutput),
    };
  }

  if (
    splitInput[0] === 'guess' &&
    splitInput[1].length !== 5 &&
    splitInput.length === 2
  ) {
    return {
      status: 200,
      result: 'Word length must be 5 letters. You entered '.concat(
        '`',
        splitInput[1],
        '`',
      ),
    };
  }

  if (splitInput[0] === 'help' && splitInput.length === 1) {
    return {
      status: 200,
      result:
        'Use command "guess <word>" to make a wordle guess! Normal wordle rules apply :monkey: \n \n(But beware of the twist...:clock1: ) \n \n Want to see todays top scores? Use "leader" to find out',
    };
  }

  if (splitInput[0] === 'leader' && splitInput.length === 1) {
    return {
      status: 200,
      result: await listOfLeaders(),
    };
  }

  return {
    status: 200,
    result: 'Not a valid command, use "help" for valid commands',
  };
};

export const countCharacterOccurrence = (target: string) => {
  const characterOccurrences: { [key: string]: number } = {};
  for (let x = 0, length = target.length; x < length; x++) {
    const l = target.charAt(x);
    characterOccurrences[l] = isNaN(characterOccurrences[l])
      ? 1
      : characterOccurrences[l] + 1;
  }
  return characterOccurrences;
};
