import { getGuesses } from '../DynamoDB/Guess/guess';

let remaining = 'a b c d e f g h i j k l m n o p q r s t u v w x y z ';
export const remainingLetters = async (user: string, timeStamp: string) => {
  const guesses = await getGuesses(user, timeStamp);
  guesses.forEach((attempt) => {
    for (const char of attempt.guess) {
      remaining = remaining.replace(char, '-');
    }
  });
  return remaining.toUpperCase();
};
