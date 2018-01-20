import React, { Component } from "react";
import CodeMirror from "react-codemirror2";
import io from "socket.io-client/dist/socket.io.js";
import axios from "axios";
import { throttle } from "lodash";

import Stdout from "./StdOut/index.jsx";
import EditorHeader from "./EditorHeader";
import Button from "../globals/Button";

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import './Sling.css';
import Message from '../Message/Message.jsx';
import MessageBox from '../MessageBox/MessageBox.jsx'; 
import Test from '../Tests/Test.jsx'

class Sling extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      ownerText: null,
      challengerText: null,
      startingText: null,
      text: "",
      challenge: "",
      stdout: "",
      record: {},
      startTime: "",
      endTime: "",
      recording: false,
      topScore: null,
      input: '', 
      output: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this); 
    this.handleOutputChange = this.handleOutputChange.bind(this); 
    this.addTestCase = this.addTestCase.bind(this); 
  }

  componentDidMount() {
    console.log(this.props, 'fuckyou')
    const { socket, challenge } = this.props;
    const startChall =
      typeof challenge === "string" ? JSON.parse(challenge) : {};
    socket.on("connect", () => {
      socket.emit("client.ready", startChall);
    });

    socket.on("server.initialState", ({ id, text, challenge }) => {
      this.setState({
        id,
        ownerText: text,
        startingText: text,
        challengerText: text,
        challenge,
      });
    });

    socket.on("server.changed", ({ text, email }) => {
      if (localStorage.getItem("email") === email) {
        this.setState({ ownerText: text });
      } else {
        this.setState({ challengerText: text });
      }
    });

    socket.on("server.run", ({ stdout, email }) => {
      const ownerEmail = localStorage.getItem("email");
      email === ownerEmail ? this.setState({ stdout }) : null;
    });

    let chal = JSON.parse(this.props.challenge)
    axios.post('http://localhost:3396/api/challenges/currentTopScore', { challengeId: chal.id })
      .then( (res) => {
        this.setState({
          topScore: res.data
        })
      })
      .catch( err => {
        console.log(err);
      })

    window.addEventListener("resize", this.setEditorSize);
  }

  submitCode = () => {
    const { socket } = this.props;
    const { ownerText } = this.state;
    const { input } = this.state; 
    const { output } = this.state; 
    const email = localStorage.getItem('email');
    socket.emit('client.run', { text: ownerText, email, input, output });
    // if test cases pass
    // run below
    this.setState({
      recording: false,
      endTime: Date.now()
    });
    console.log("start", this.state.startTime);
    let ended = Date.now();
    let overallTime = ended - this.state.startTime;


    console.log("overallTime", overallTime);
    
    const payload = {
      contents: this.state.record,
      challengeId: this.state.challenge.id,
      email,
      time: overallTime
    };
    if ( !this.state.topScore ) {
      axios
        .post("http://localhost:3396/api/challenges/addTopScore", payload)
        .then(res => {
          this.setState({
            topScore: res.data,
            recording: false,
            endTime: ended
          });
        })
        .catch(err => {
          console.log(err);
        });
      } else {
        if ( overallTime < this.state.topScore.time ) {
          axios.put("http://localhost:3396/api/challenges/newTopScore", payload)
            .then(res => {
              console.log('updated', res)
              // this.setState({
              //   topScore: res.data,
              //   recording: false,
              //   endTime: ended
              // });
            })
            .catch(err => {
              console.log(err);
            });
        } 
      }          
  };
 

  handleChange = throttle((editor, metadata, value) => {
    const email = localStorage.getItem("email");
    this.props.socket.emit("client.update", { text: value, email });

    this.state.recording
      ? (this.state.record[
          (Date.now() - this.state.startTime) / 1000
        ] = this.state.ownerText)
      : null;

  }, 250);

  setEditorSize = throttle(() => {
    this.editor.setSize(null, `${window.innerHeight - 70}px`);
  }, 60);

  initializeEditor = editor => {
    this.editor = editor;
    this.setEditorSize();
  };

  onDuelClick = () => {
    if (!this.state.startTime) {
      // setTimeout( () => {
      this.setState({
        startTime: Date.now(),
        recording: true,
        ownerText: this.state.startingText,
        challengerText: this.state.startingText,
        record: {}
      });
      //   }, 3000
      // )1

      if ( this.state.topScore ) {
        var timeMarker = null;
        var timeBeforeNextMarker = null;
  
        for (let timeStamp in this.state.topScore.contents) {
          if (timeMarker) {
            timeBeforeNextMarker = timeStamp - timeMarker;
          } else {
            timeBeforeNextMarker = 0;
            timeMarker = timeStamp;
          }
          setTimeout(() => {
            this.setState({ challengerText: this.state.topScore.contents[timeStamp] });
          }, timeBeforeNextMarker * 1000);
        }
      }
    }
  };

  addTestCase() {
    //add test case to database
  console.log(this.state); 
  }

  handleInputChange(e) {
    this.setState({
        input: e.target.value
    }); 
  }

  handleOutputChange(e) {
  this.setState({
      output: e.target.value
  }); 
  }

  render() {
    console.log("this.state for sling", this.state);
    const { socket } = this.props;
    return (
      <div className="sling-container">
        <EditorHeader />
        <div className="code1-editor-container">
          <CodeMirror className="mirror"
            editorDidMount={this.initializeEditor}
            value={this.state.ownerText}
            options={{
              mode: "javascript",
              lineNumbers: true,
              theme: "base16-dark"
            }}
            onChange={this.handleChange}
            />
            <MessageBox className="message" socket={this.props.socket} />
        </div>
        <div className="stdout-container">
          <Button
            className="run-btn"
            text="Duel the TOP SCORER"
            backgroundColor="red"
            color="white"
            onClick={() => this.onDuelClick()}
          />
            {this.state.challenge.title || this.props.challenge.title}
            <br/>
            {this.state.challenge.content || this.props.challenge.content}
          <Stdout text={this.state.stdout} socket={this.props.socket}/>
          <Button
            className="run-btn"
            text="Run Code"
            backgroundColor="red"
            color="white"
            onClick={() => this.submitCode()}
          />
          <Test socket={this.props.socket}
          handleInputChange={this.handleInputChange}
          handleOutputChange={this.handleOutputChange}
          addTestCase={this.addTestCase}/> 
          <Message className="message" socket={this.props.socket}/>
        </div>
        <div className="code2-editor-container">
          <CodeMirror className="mirror"
            editorDidMount={this.initializeEditor}
            value={this.state.challengerText}
            options={{
              mode: "javascript",
              lineNumbers: true,
              theme: "base16-dark",
              readOnly: true
            }}
          />
        </div>
      </div>
    );
  }
}

export default Sling;

// have to check if the time recorded on challenge against bot
//  if your time < bot time
//  your time is now the highest score  => replace the tiemstamp ovbject with the current one
// while sending down the timestamp object =>

// const payload = {
//  totalTime: this.state.endTime - this.state.startTime,
//  email :  ??,
//  challengeID: ??
//  bot: this.state.record
//}