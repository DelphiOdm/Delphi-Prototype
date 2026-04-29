import React, { useState, useRef, useEffect } from "react";
import "./intellegence.css";

function Intellegence() {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);


  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = message;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/intellegence/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userMessage
          })
        }
      );

      const data = await res.json();

      console.log("API Response:", data);

      if (data.data && data.data.length > 0) {

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            table: data.data
          }
        ]);

      }
      else if (data.response) {

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.response
          }
        ]);

      }
      else if (data.error) {

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.error
          }
        ]);

      }
      else {

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "No data returned."
          }
        ]);

      }

    }
    catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Error connecting to server."
        }
      ]);

    }

    setLoading(false);

  };


  const handleKeyDown = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();
      sendMessage();

    }

  };


  return (

    <div className="main-container">

      {/* LEFT PANEL */}
      <div className="left-panel">

        <h3 className="panel-title">
          Ask Delphi
        </h3>

        <textarea
          rows="5"
          className="input-box"
          placeholder="Type your prompt..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={sendMessage}
          className="ask-button"
        >
          Ask Delphi
        </button>

      </div>



      {/* RIGHT PANEL */}
      <div className="right-panel">

        <div className="chat-window">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={
                msg.sender === "user"
                  ? "message user"
                  : "message bot"
              }
            >

              {/* TEXT */}
              {msg.text && (

                <div className="bubble">
                  {msg.text}
                </div>

              )}



              {/* TABLE */}
              {msg.table && (

                <div className="table-wrapper">

                  <table className="data-table">

                    <thead>
                      <tr>

                        {Object.keys(
                          msg.table[0]
                        ).map((col, i) => (

                          <th key={i}>
                            {col}
                          </th>

                        ))}

                      </tr>
                    </thead>

                    <tbody>

                      {msg.table.map(
                        (row, rowIndex) => (

                          <tr key={rowIndex}>

                            {Object.values(row).map(
                              (val, colIndex) => (

                                <td key={colIndex}>
                                  {val}
                                </td>

                              )
                            )}

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          ))}



          {loading && (

            <div className="loading">
              Thinking...
            </div>

          )}

          <div ref={chatEndRef} />

        </div>

      </div>

    </div>

  );

}

export default Intellegence;