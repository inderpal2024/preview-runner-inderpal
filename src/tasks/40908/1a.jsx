import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  const [matches, setMatches] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState({ question: '', answer: '' });
  const [isMatching, setIsMatching] = useState(false);

  const addMatch = () => {
    if (!question || !answer) {
      setError({
        question: !question ? 'Question cannot be empty' : '',
        answer: !answer ? 'Answer cannot be empty' : '',
      });
      return;
    }

    if (matches.some(match => match.question === question)) {
      setError({ question: 'Question must be unique', answer: '' });
      return;
    }

    setMatches([...matches, { question, answer }]);
    setQuestion('');
    setAnswer('');
    setError({ question: '', answer: '' });
  };

  const removeMatch = (index) => {
    setMatches(matches.filter((_, i) => i !== index));
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [results, setResults] = useState({});

  const handleMatch = (answer) => {
    if (selectedQuestion === null) return;

    const correctAnswer = matches.find(m => m.question === selectedQuestion).answer;
    setResults(prev => ({
      ...prev,
      [selectedQuestion]: answer === correctAnswer
    }));
    setSelectedQuestion(null);
  };

  const resetMatching = () => {
    setIsMatching(false);
    setSelectedQuestion(null);
    setResults({});
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Match the Columns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input 
            value={question} 
            onChange={(e) => {setQuestion(e.target.value); setError({...error, question: ''});}}
            placeholder="Enter question" 
            className={error.question ? 'border-red-500' : ''}
          />
          {error.question && <p className="text-sm text-red-500">{error.question}</p>}
          <Input 
            value={answer} 
            onChange={(e) => {setAnswer(e.target.value); setError({...error, answer: ''});}}
            placeholder="Enter answer" 
            className={error.answer ? 'border-red-500' : ''}
          />
          {error.answer && <p className="text-sm text-red-500">{error.answer}</p>}
          <Button onClick={addMatch}>Add Match</Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <>
          <Button onClick={() => setIsMatching(!isMatching)}>
            {isMatching ? 'Create' : 'Show'}
          </Button>

          {isMatching ? (
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="space-y-2">
                {shuffleArray(matches.map(m => m.question)).map((q, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedQuestion(q)} 
                    className={`p-2 border rounded cursor-pointer ${selectedQuestion === q ? 'bg-yellow-100' : results[q] === true ? 'bg-green-100' : results[q] === false ? 'bg-red-100' : ''}`}
                  >
                    {q}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {shuffleArray(matches.map(m => m.answer)).map((a, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleMatch(a)} 
                    className={`p-2 border rounded cursor-pointer ${results[matches.find(m => m.answer === a)?.question] === true ? 'bg-green-100' : results[matches.find(m => m.answer === a)?.question] === false ? 'bg-red-100' : ''}`}
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Answer</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match, index) => (
                  <TableRow key={index}>
                    <TableCell>{match.question}</TableCell>
                    <TableCell>{match.answer}</TableCell>
                    <TableCell><Button onClick={() => removeMatch(index)}>Delete</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}

export default App;