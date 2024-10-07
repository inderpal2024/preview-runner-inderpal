import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

function App() {
  const [matches, setMatches] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [warnings, setWarnings] = useState({ question: "", answer: "" });
  const [isShowing, setIsShowing] = useState(false);
  const [gameState, setGameState] = useState({ questions: null, answers: null, selectedQuestion: null,
      incorrectQuestion: null, incorrectAnswer: null });

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  const shuffleAndReset = () => {
    const shuffledQuestions = shuffleArray(matches.map(m =>
        ({ id: m.id, text: m.question, answer: m.answer, matched: false })));
    const shuffledAnswers = shuffleArray(matches.map(m =>
        ({ id: m.id, text: m.answer, matched: false })));

    setGameState({ questions: shuffledQuestions, answers: shuffledAnswers,
        selectedQuestion: null, incorrectQuestion: null, incorrectAnswer: null });
  };

  const handleAddMatch = () => {
    if (!question || !answer) {
      setWarnings({
        question: !question ? "Question must not be empty" : "",
        answer: !answer ? "Answer must not be empty" : ""
      });
      return;
    }
    
    if (matches.some(match => match.question === question)) {
      setWarnings({ question: "Question must be unique", answer: "" });
      return;
    }

    setMatches([...matches, { question, answer }]);
    setQuestion("");
    setAnswer("");
    setWarnings({ question: "", answer: "" });
  };

  const handleDelete = (index) => {
    setMatches(matches.filter((_, i) => i !== index));
  };

  const handleShowToggle = () => {
    shuffleAndReset();
    setIsShowing(!isShowing);
  };

  const handleBoxClick = (type, match) => {
    if (type === 'question' && !match.matched) {
      setGameState({ ...gameState, selectedQuestion: match, incorrectAnswer: null, incorrectQuestion: null });
    } else if (type === 'answer' && gameState.selectedQuestion) {
      const correct = gameState.selectedQuestion.answer === match.text;
      let incorrectAnswer = null, incorrectQuestion = null;

      if (correct) {
        gameState.selectedQuestion.matched = true;
        match.matched = true;
      } else {
        incorrectQuestion = gameState.selectedQuestion
        incorrectAnswer = match;
      }

      setGameState({ ...gameState, selectedQuestion: null, incorrectAnswer, incorrectQuestion });
    }
  };

  const Box = ({ match, type }) => {
    let color = '';

    if (type === 'question' && gameState.selectedQuestion === match) {
      color = 'bg-yellow-100';
    } else if (match.matched) {
      color = 'bg-green-100';
    } else if (gameState.incorrectQuestion === match || gameState.incorrectAnswer === match) {
      color = 'bg-red-100';
    }

    return (
      <div 
          className={`p-4 m-2 border rounded cursor-pointer ${color}`}
          onClick={() => handleBoxClick(type, match)}>
        {match.text}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {!isShowing ? (
        <>
          <Card>
            <CardContent>
              <Input 
                value={question} 
                onChange={(e) => {setQuestion(e.target.value); setWarnings({...warnings, question: ''});}}
                placeholder="Question" 
                className={(warnings.question ? 'border-red-500' : '') + ' mt-6'}
              />
              {warnings.question && <p className="text-sm text-red-500">{warnings.question}</p>}
              <Input 
                value={answer} 
                onChange={(e) => {setAnswer(e.target.value); setWarnings({...warnings, answer: ''});}}
                placeholder="Answer" 
                className={(warnings.answer ? 'border-red-500' : '') + ' mt-2'}
              />
              {warnings.answer && <p className="text-sm text-red-500">{warnings.answer}</p>}
              <Button onClick={handleAddMatch} className="mt-4">Add Match</Button>
            </CardContent>
          </Card>
          { matches.length
            ? <>
                <Button onClick={handleShowToggle} className="my-4">Show</Button>
                <Table>
                  <TableBody>
                    {matches.map((match, index) => (
                      <TableRow key={index}>
                        <TableCell>{match.question}</TableCell>
                        <TableCell>{match.answer}</TableCell>
                        <TableCell><Button onClick={() => handleDelete(index)}>Delete</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            : <></>}
        </>
      ) : (
        <>
          <Button onClick={handleShowToggle}>Create</Button>
          <div className="flex justify-center mt-5">
            <div className="flex flex-col items-center">
              {gameState.questions.map((q, idx) => <Box key={idx} match={q} type="question" />)}
            </div>
            <div className="flex flex-col items-center">
              {gameState.answers.map((a, idx) => <Box key={idx} match={a} type="answer" />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;