import React, { useState, useEffect } from "react";
import styles from "./RandomQueries.module.css"; // You'll need to create this CSS module
import { Grid } from "@mui/material";

const queries =  [
  "According to the narrator, what is impossible for a bee to do?",
  "What does Barry choose to wear for his special day?",
  "What is Barry's mother, Janet, doing when he enters the kitchen?",
  "How does Barry communicate with Adam before heading out for the day?",
  "What job does Barry think is not suited for him in the honey field?",
  "What does Barry and Adam's graduation ceremony culminate in?",
  "What does the tour guide at Honex Industries explain about bee jobs?",
  "How does Barry react to the idea of working one job for the rest of his life?",
  "What role does Barry's cousin play during the tour at Honex Industries?",
  "What happens when Barry and Adam try to impress the pollen jocks?"
]

const getRandomQueries = (arr, n) => {
  let shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const RandomQueries = ({ onQuerySelect }) => {
  const [randomQueries, setRandomQueries] = useState([]);

  useEffect(() => {
    setRandomQueries(getRandomQueries(queries, 3));
  }, []);

  return (
    <>
      <div className="random-queries-container">
        {randomQueries.map((query, index) => (
          <Grid
            className="random-query-card"
            onClick={() => {
              onQuerySelect(query);
            }}
            item
            xs={4}
            md={4}
          >
            {query}
          </Grid>
        ))}
      </div>
    </>
  );
};

export default RandomQueries;
