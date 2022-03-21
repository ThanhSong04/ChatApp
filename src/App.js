import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import "./App.css";
const host = "http://localhost:3000";

function App() {
  const [mess, setMess] = useState([]);
  const [message, setMessage] = useState("");
  const [messageindex, setMessageindex] = useState("");
  const [id, setId] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const socketRef = useRef();
  const messagesEnd = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient.connect(host);

    socketRef.current.on("getId", (data) => {
      setId(data);
    });

    socketRef.current.on("sendDataServer", (dataGot) => {
      setMess((oldMsgs) => [...oldMsgs, dataGot.data]);
      scrollToBottom();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);
  const sendMessage = () => {
    if (message !== null) {
      const msg = {
        content: message,
        id: id,
      };
      if (!isEdit) {
        socketRef.current.emit("sendDataClient", msg);
      } else {
        mess[messageindex].content = message;
        setMess(mess);
        setIsEdit(false);
      }
      setMessage("");
    }
  };
  const editMessage = (m, index) => {
    setIsEdit(true);
    setMessageindex(index);
    setMessage(m.content);
    textareaRef.current.focus();
  };

  const scrollToBottom = () => {
    messagesEnd.current.scrollIntoView({ behavior: "smooth" });
  };
  const renderMess = mess.map((m, index) => (
    <div key={index} className="message_item">
      <div
        className={`${m.id === id ? "your-message" : "other-people"} chat-item`}
      >
        {m.content}
      </div>
      <span
        className="btn_delete"
        onClick={() => {
          const valueRemove = m;
          const new_arr = mess.filter((item) => item !== valueRemove);
          console.log(new_arr);
          setMess(new_arr);
        }}
      >
        <i className="fa-solid fa-xmark"></i>
      </span>
      <span className="btn_edit" onClick={() => editMessage(m, index)}>
        <i className="fa-solid fa-pen-to-square"></i>
      </span>
    </div>
  ));

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      sendMessage();
    }
  };
  return (
    <div className="box-chat">
      <div className="box-chat_message">
        {renderMess}
        <div style={{ float: "left", clear: "both" }} ref={messagesEnd}></div>
      </div>

      {isEdit ? (
        <div className="send-box">
          <textarea
            ref={textareaRef}
            value={message}
            onKeyDown={onEnterPress}
            onChange={handleChange}
            placeholder="Nhập tin nhắn ..."
          />
          <button onClick={sendMessage}>Edit</button>
        </div>
      ) : (
        <div className="send-box">
          <textarea
            ref={textareaRef}
            value={message}
            onKeyDown={onEnterPress}
            onChange={handleChange}
            placeholder="Nhập tin nhắn ..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
