import React, { useState } from "react";
import axios from "axios";
import "./MathQuiz.css";

const generateQuestion = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ["+", "-", "*"];
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let answer;
  if (operator === "+") answer = num1 + num2;
  else if (operator === "-") answer = num1 - num2;
  else if (operator === "*") answer = num1 * num2;

  return { num1, num2, operator, answer };
};

const MathQuiz = () => {
  const [question, setQuestion] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(userAnswer) === question.answer) {
      const newScore = score + 1;
      setScore(newScore);

      // Send progress data to backend
      try {
        await axios.post(
          "http://localhost:5000/api/patient/progress",
          { gameId: "math_quiz", score: newScore },
          { headers: { "x-auth-token": token } }
        );
      } catch (error) {
        console.error("Failed to save progress", error);
      }
    }
    setUserAnswer("");
    setQuestion(generateQuestion());
  };

  return (
    <div className="quiz-container">
      <h2>Math Quiz Game</h2>
      <p className="score">Score: {score}</p>

      <div className="question">
        <h3>
          {question.num1} {question.operator} {question.num2} = ?
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default MathQuiz;
