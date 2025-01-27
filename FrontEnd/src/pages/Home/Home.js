import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import RandomQueries from "../../components/IconsHolder/RandomQueries/RandomQueries";
import micActiveLogo from "../../assets/Images/stop-button.png";
import thunbup from "../../assets/svg/g1.svg";
import thundown from "../../assets/svg/g1-1.svg";
import remarkGfm from "remark-gfm";
import Shimmer from "./Shimmer"; 
import {
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Modal,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Typography from "@mui/material/Typography";
import {
  Send as SendIcon,
} from "@mui/icons-material";
import axios from "axios";
import Markdown from "react-markdown";
import styles from "./Home.module.css";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";

const sdk = require("microsoft-cognitiveservices-speech-sdk");
const SPEECH_KEY = "YOUR API KEY";
const SPEECH_REGION = "eastus";
const speechConfig = sdk.SpeechConfig.fromSubscription(
  SPEECH_KEY,
  SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = "en-US";
speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";

const Home = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [messages, setMessages] = useState([]);
  console.log(messages, "values inside message ");
  const [answers, setAnswers] = useState("");
  const [widthM, setWidthM] = useState("100%");
  const queryRef = useRef(null);
  const [open, setOpen] = useState(true);
  const [transcription, setTranscription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [selectedItem, setSelectedItem] = useState("");
  const [isCollapse5, setIsCollapse5] = useState(false);
  const [loadingChatHistory, setLoadingChatHistory] = useState(false);
  const [files, setFiles] = useState();
  const [selectedIndex, setSelectedIndex] = useState("");
  const [selectedChatHistory, setSelectedChatHistory] = useState("");

  const today = new Date();

  const date_for_file = today.toISOString().split("T")[0];

  const handleCollapse5 = async () => {
    setLoadingChatHistory(true);
    const response = await axios.get(
      "http://127.0.0.1:8000/list_files"
    );
    console.log(response.data);
    setFiles(response.data);  
    setIsCollapse5(true);
    setLoadingChatHistory(false);
  };

  const transformData = (rawData) => {
    let transformedData = [];
    rawData.forEach((item) => {
      const userMessage = { answer: item.Query, sender: "user" };
      const botMessage = { sender: "bot", display: 1, answer: item.Response };
      transformedData.push(userMessage, botMessage);
    });
    return transformedData;
  };

  const get_file = async (event) => {
    // event.preventDefault();
    const selectedFile = event.target.value;
    setSelectedIndex(selectedFile);
    setMessages([]);
    console.log("get_file_single");
    console.log("this is file name" + selectedFile);
    const response = await axios.post(
      "http://127.0.0.1:8000/one_file",
      {
        file: selectedFile,
      }
    );
    console.log(typeof response);
    console.log(response.data);
    const transformedMessages = transformData(response.data);
    setMessages(transformedMessages);
    setIsOpen(false);
  };

  useEffect(() => {
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      "f4a8f5be7801494fa47bc87d6d8ca31d",
      "eastus"
    );

    // Create the recognizer
    const speechRecognizer = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    setRecognizer(speechRecognizer);

    return () => {
      if (speechRecognizer) {
        speechRecognizer.close();
      }
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    comment: "",
    like: "",
    Query: "",
    Response: "",
  });
  const [activeIcon, setActiveIcon] = useState({});
  console.log(feedback, "feedback value");
  const handleThumbClick = (reaction, index, value) => {
    console.log("Reaction:", reaction);
    console.log("Question answered:", value);
    setActiveIcon((prev) => ({
      ...prev,
      [`yes_${index}`]: reaction === "yes", 
      [`no_${index}`]: reaction === "no", 
    }));

    const like = reaction;
    console.log(`Thumb clicked with value: ${value}`);

    // Update feedback state with question and answer for API
    setFeedback((prev) => ({
      ...prev,
      like: like, // Store the reaction (like or dislike)
      Response: value.answer, // Store the bot's response
      Query: value.question, // Store the user's question
    }));
    feedbackApi({
      Query: value.question,
      Response: value.answer,
      Feedback: like === "yes" ? "Positive" : "Negative",
    });
  };

  const feedbackApi = async (formattedFeedback) => {
    try {
      const response = await axios.post(
        "http://192.168.0.78:8088/fetch_feedback",
        formattedFeedback
      );
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error occurred while sending feedback:", error);
    }
  };

  const handleCommentClick = (index, value) => {
    setFeedback((prev) => ({
      ...prev,
      Query: value.question,
      Response: value.answer,
    }));
    setIsModalOpen(true);
  };

  const handlefeedback = async (e) => {
    e.preventDefault();

    const payload = {
      Feedback_text: feedback.comment,
      Query: feedback.Query,
      Response: feedback.Response,
    };

    try {
      const response = await axios.post(
        "http://192.168.0.78:8088/fetch_feedback",
        payload
      );
      console.log("Response:", response.data);
      if (response.data.code === "200") {
        alert("Feedback submitted successfully");
        closeModal();
      }
      // Handle success logic here (e.g., display a success message)
    } catch (error) {
      console.error("Error submitting feedback:", error);

      // Handle error logic here (e.g., display an error message)
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error("Response data:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        // No response received from the server
        console.error("No response received:", error.request);
      } else {
        // Something happened while setting up the request
        console.error("Error setting up request:", error.message);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const correctSpecialWords = (text) => {
    return text
      .split(" ")
      .map((word) => {
        switch (word.toLowerCase()) {
          case "BARRI":
            return "BARRY";
          default:
            return word;
        }
      })
      .join(" ");
  };

  const startListening = async () => {
    if (recognizer) {
      setIsListening(true);

      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log("Continuous recognition started");
        },
        (error) => {
          console.error("Error starting continuous recognition:", error);
          setIsListening(false);
        }
      );

      let previousWords = [];
      let currentSearchValue = "";

      recognizer.recognizing = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizingSpeech) {
          const currentWords = e.result.text.split(" ");
          const newWords = currentWords.filter(
            (word) => !previousWords.includes(word)
          );

          if (newWords.length > 0) {
            const interimText = correctSpecialWords(newWords.join(" "));
            currentSearchValue = (
              currentSearchValue +
              " " +
              interimText
            ).trim();

            console.log("Interim words:", interimText);
            console.log("Updated Search Value:", currentSearchValue);

            setSearchValue(currentSearchValue);
            previousWords = [...previousWords, ...newWords];
          }
        }
      };

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          setTranscription((prevTranscription) => {
            // Correct the recognized text
            const correctedText = correctSpecialWords(e.result.text);
            const newTranscription = prevTranscription + " " + correctedText;

            console.log("RECOGNIZED:", e.result.text);
            console.log("Corrected Text:", correctedText);
            console.log("New Transcription:", newTranscription);

            setSearchValue(newTranscription);
            return newTranscription;
          });
        } else if (e.result.reason === sdk.ResultReason.NoMatch) {
          console.log("NOMATCH: Speech could not be recognized.");
        }
      };
    }
  };

  const stopListening = () => {
    setTranscription("");
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          console.log("Continuous recognition stopped");
          setIsListening(false);
        },
        (error) => {
          console.error("Error stopping continuous recognition:", error);
        }
      );
    }
  };

  const handleRelatedQuestionClick = (question) => {
    getAnswer(question);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const drawerWidth = 280;

  const handleInputChange = (event) => {
    setSearchValue(event.target.value);
  };

  const getAnswer = async (temp) => {
    setIsNewChat(false);
    const query = temp || searchValue.trim();
    if (!query) {
      return;
    }

    setSearchValue("");
    setTranscription("");
    stopListening();

    const userMessage = { answer: query, sender: "user" };
    const botMessage = {
      sender: "bot",
      display: 0,
      answer: "",
      isProcessing: true,
    };
    setMessages([...messages, userMessage, botMessage]);
    setIsOpen(false);

    if (query) {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/rag_qa_api_stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: query }),
          }
        );

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          responseText += chunk;
          const currentResponseText = responseText;
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].answer = currentResponseText;
            newMessages[newMessages.length - 1].isProcessing = false;
            return newMessages;
          });
        }
        setTranscription("");
      } catch (error) {
        console.error("Error in llm:", error);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        getAnswer();
      }
    };

    const inputElement = queryRef.current;
    if (inputElement) {
      inputElement.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKeyPress);
      }
    };
  });


  function handleResize() {
    if (window.innerWidth < 800) {
      setOpen(false);
      setIsLargeScreen(false);
    } else {
      setOpen(true);
      setIsLargeScreen(true);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    handleResize();
  }, []);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth", // Smooth scrolling
      });
    }
  };

  useEffect(() => {
    if (messages[messages.length - 1]?.sender !== "bot_rq") {
      scrollToBottom();
    }
  }, [messages, answers]);

  console.log(open, isLargeScreen);

  return (
    <>
      <div
        className="scroll-Container convogen-whole-container"
        style={{
          backgroundImage: "url('./bg.png')",
        }}
      >
        {/* sidebar */}

        {open && (
          <div
            className={
              isLargeScreen
                ? "sidebar-ui-cont hide-scrollbar large-screen"
                : "sidebar-ui-cont hide-scrollbar small-screen"
            }
            style={{
              maxWidth: drawerWidth,
            }}
          >
            <div className="sidebar-header">
               <div className={styles.title}>OpenLake LLP</div>
              <IconButton
                onClick={() => {
                  setOpen(false);
                }}
                style={{
                  aspectRatio: "1",
                }}
              >
                <img src="./burger.svg" alt="burger" />
              </IconButton>
            </div>
            <button
              className="btn new-chat-btn-ui"
              onClick={() => {
                window.location.reload();
              }}
            >
              + New Chat
            </button>
            <List>
              <ListItem disablePadding sx={{ marginBottom: "8px" }}>
                <ListItemButton
                  sx={{
                    "&:hover": {
                      backgroundColor: "#C7E1FE8A",
                    },
                    backgroundColor:
                      selectedItem === "history" ? "#C7E1FE8A" : "transparent",
                    borderRadius: "10px",
                  }}
                  onClick={() => {
                    if (isCollapse5) setIsCollapse5(false);
                    else handleCollapse5();
                    setSelectedItem("history");
                  }}
                >
                  <ListItemIcon
                    style={{ minWidth: "20px", marginRight: "8px" }}
                  >
                    <WidgetsOutlinedIcon
                      sx={{ fontSize: 20, color: "#00A9FF" }}
                    />
                  </ListItemIcon>
                  <ListItemText primary="History" />
                  {isCollapse5 ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              {loadingChatHistory && <p>Loading...</p>}
              <Collapse
                in={isCollapse5}
                timeout="auto"
                unmountOnExit
                sx={{
                  padding: "10px",
                }}
              >
                {files &&
                  files.map((file) => (
                    <p
                      onClick={() => {
                        setIsNewChat(false);
                        setSelectedChatHistory(file);
                        get_file({ target: { value: file } });
                      }}
                      className={`chat-history-card ${
                        selectedChatHistory === file ? "active" : ""
                      }`}
                    >
                      {file.charAt(0).toUpperCase() + file.slice(1)}
                    </p>
                  ))}
              </Collapse>
            </List>
          </div>
        )}

        <div className="scroll-Container chat-whole-container">
          {!open && (
            <IconButton className="drawer-open-icon" onClick={handleDrawerOpen}>
              <img src="./burger.svg" alt="burger" />
            </IconButton>
          )}

          {isNewChat ? (
            <div className="chat-content-cont">
              <div className="chat-content-header">
                <p className="chat-content-head-para">
                  Hey,{" "}
                  <i>
                    Welcome to <span>OpenLake</span>{" "}
                  </i>
                </p>
                <p className="chat-content-title-para">How Can I Help?</p>
              </div>
              {/* Search bar */}
              <div className="big-searchBar-cont">
                <div className="big-searchBar">
                  <Button
                    className={
                      isListening
                        ? "big-search-mic-btn mic-red"
                        : "big-search-mic-btn mic-blue"
                    }
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <img
                        src={micActiveLogo}
                        alt="Mic Active"
                        style={{ height: "24px" }}
                      />
                    ) : (
                      <KeyboardVoiceIcon className="micIcon" />
                    )}
                  </Button>
                  <input
                    ref={queryRef}
                    placeholder="Enter the prompt"
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") getAnswer();
                    }}
                    className="bigsearhbar-input-ui"
                  />
                  <Button
                    className="big-search-send-btn"
                    onClick={() => {
                      getAnswer();
                    }}
                  >
                    <SendIcon className="sendIcon" />
                  </Button>
                </div>
              </div>
              <RandomQueries onQuerySelect={(query) => getAnswer(query)} />
            </div>
          ) : (
            <>
              <div className="chat-cont">
                <div
                  ref={messagesEndRef}
                  className="scroll-Container hide-scrollbar chat-search-results-content"
                >
                  {messages?.map((message, index) => (
                    <div
                      key={index}
                      className="scroll-container"
                      style={{
                        display: "flex",
                        justifyContent:
                          message?.sender === "user"
                            ? "flex-end"
                            : "flex-start",
                        flexDirection:
                          message?.sender === "user" ? "" : "column",
                      }}
                    >
                      {message?.sender === "user" && (
                        <p
                          style={{
                            backgroundColor:
                              message?.sender === "user"
                                ? "#C7E1FE8A"
                                : "unset",
                          }}
                          className="wrap-text chat-wrap-text"
                        >
                          {message.answer}
                        </p>
                      )}
                      {message?.sender === "bot" && (
                        <div className="wrap-text chat-wrap-text-bot">
                          {message?.answer && (
                            <div>
                              <img alt="" src="./star.svg" />
                            </div>
                          )}
                          {message?.isProcessing && <Shimmer />}
                          {message?.answer && (
                            <div
                              onClick={() => {
                                setMessages((prev) => {
                                  let values = [...prev];
                                  values[index]["display"] = 1;
                                  return values;
                                });
                              }}
                              style={{
                                width: message.display !== 0 ? "100%" : widthM,
                                marginBottom: "0px",
                              }}
                            >
                              <Markdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ node, ...props }) => (
                                    <a
                                      {...props}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    />
                                  ),
                                }}
                              >
                                {message.answer}
                              </Markdown>
                            </div>
                          )}
                        </div>
                      )}
                      {message?.sender === "bot_rq" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                           p:4,
                            margin: "5px 15px 15px 24px", // 10px for both top and bottom, 0 for left and right
                          }}
                        >
                          <img
                            src={thunbup}
                            alt="thumpup"
                            fill={
                              activeIcon[`yes_${index}`] ? "red" : "inherit"
                            }
                            style={{
                              marginRight: "10px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              // Update active icon state and pass the appropriate values
                              setActiveIcon((prev) => ({
                                ...prev,
                                [`yes_${index}`]: true, // Set the "yes" reaction for this specific index
                              }));
                              handleThumbClick("yes", index, {
                                question: messages[index - 2]?.answer, // Previous user question
                                answer: messages[index - 1]?.answer, // Current bot answer
                              });
                            }}
                          />

                          <img
                            src={thundown}
                            alt="Description of the SVG"
                            fill={
                              activeIcon[`no_${index}`] ? "blue" : "inherit"
                            }
                            style={{
                              marginRight: "10px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              // Update active icon state and pass the appropriate values
                              setActiveIcon((prev) => ({
                                ...prev,
                                [`no_${index}`]: true, // Set the "no" reaction for this specific index
                              }));
                              handleThumbClick("no", index, {
                                question: messages[index - 2]?.answer, // Previous user question
                                answer: messages[index - 1]?.answer, // Current bot answer
                              });
                            }}
                          />

                          <Typography
                            variant="body1"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "15px",
                              fontWeight: 400,
                              lineHeight: "18.15px",
                              textAlign: "left",
                              textUnderlinePosition: "from-font",
                              textDecorationSkipInk: "none",
                              cursor: "pointer",
                              color: " #40444C",
                          
                            }}
                            onClick={() =>
                              handleCommentClick(index, {
                                question: messages[index - 2]?.answer, // Previous user question
                                answer: messages[index - 1]?.answer, // Current bot answer
                              })
                            }
                          >
                            Feedback
                          </Typography>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* Search bar */}
          {!isNewChat && (
            <div className="chat-search-sub-cont">
              <div className="chat-searchbar">
                <Button
                  className={
                    isListening
                      ? "mic-search-btn mic-red"
                      : "mic-search-btn mic-blue"
                  }
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? (
                    <img
                      src={micActiveLogo}
                      alt="Mic Active"
                      style={{ height: "24px" }}
                    />
                  ) : (
                    <KeyboardVoiceIcon className="micIcon" />
                  )}
                </Button>
                <input
                  ref={queryRef}
                  className="searchInput search-input-ui"
                  placeholder="Enter the prompt"
                  value={searchValue}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") getAnswer();
                  }}
                />
                <Button
                  className="search-send-btn"
                  onClick={() => {
                    getAnswer();
                  }}
                >
                  <SendIcon className="sendIcon" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            minWidth:  "438px",
            height: "auto",
            minWidth: "400px",
            backgroundColor: " #F2F6FA",
            borderRadius: "13px ", // Updated border radius
            p: 1,
            opacity: 1,
            gap: "0px", // Added gap
            border:"0px,transparent",

          }}
        >
          <Typography
            variant="h6"
            className="comment-modal-title"
            component="h2"
       
            sx={{
              textAlign: "center", // Align text in the center
              display: "flex",
              justifyContent: "center", // Ensure horizontal alignment
              alignItems: "center", // Ensure vertical alignment if needed
            }}
          >
            Add Feedback
          </Typography>
          <p className="comment-modal-description">
              Add your valuable Feedback
              </p>
          <form onSubmit={handlefeedback}>
            <textarea
              id="comment-modal-description"
              style={{ width: "100%", height: "auto", minHeight: "150px", marginBottom: "10px", border: "1px solid #5391F6" }}
              onChange={(e) =>
                setFeedback((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
            >
     
            </textarea>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="contained" type="submit" mr={2} sx={{
                backgroundColor: "#5391F6",
              }}>
                Submit Feedback
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Home;
