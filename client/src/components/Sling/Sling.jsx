import React, { Component } from "react";
import CodeMirror from "react-codemirror2";
import io from "socket.io-client/dist/socket.io.js";
import axios from "axios";
import { throttle } from "lodash";

import Stdout from "./StdOut/index.jsx";
import EditorHeader from "./EditorHeader";
import Button from "../globals/Button";

import "codemirror/mode/javascript/javascript.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/base16-dark.css";
import "./Sling.css";

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
      topScore: ''
    };
  }

  componentDidMount() {
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
        challenge
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

    window.addEventListener("resize", this.setEditorSize);
  }

  submitCode = () => {
    const { socket } = this.props;
    const { ownerText } = this.state;
    const email = localStorage.getItem("email");
    socket.emit("client.run", { text: ownerText, email });
    // if passes test cases
    this.setState({
      recording: false,
      endTime: Date.now()
    });
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
    this.editor.setSize(null, `${window.innerHeight - 80}px`);
  }, 100);

  initializeEditor = editor => {
    this.editor = editor;
    this.setEditorSize();
  };

  onRecordChange = () => {
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
      // )

      var timeMarker = null;
      var timeBeforeNextMarker = null;

      for(let timeStamp in this.state.topScore) {
        if (timeMarker) {
          timeBeforeNextMarker = timeStamp - timeMarker
        } else {
          timeBeforeNextMarker = 0;
          timeMarker = timeStamp
        }
        setTimeout( () =>  { this.setState({ challengerText : this.state.topScore[timeStamp] }) } , timeBeforeNextMarker * 1000 );
      }

    }
  };

  render() {
    const { socket } = this.props;
    return (
      <div className="sling-container">
        <EditorHeader />
        <div className="code1-editor-container">
          <CodeMirror
            editorDidMount={this.initializeEditor}
            value={this.state.ownerText}
            options={{
              mode: "javascript",
              lineNumbers: true,
              theme: "base16-dark"
            }}
            onChange={this.handleChange}
          />
        </div>
        <div className="stdout-container">
          <Button
            className="run-btn"
            text="Duel the TOP SCORER"
            backgroundColor="red"
            color="white"
            onClick={() => this.onRecordChange()}
          />
          <Button
            className="run-btn"
            text="Run Code"
            backgroundColor="red"
            color="white"
            onClick={() => this.submitCode()}
          />
          {this.state.challenge.title || this.props.challenge.title}
          <br />
          {this.state.challenge.content || this.props.challenge.content}
          <Stdout text={this.state.stdout} />
        </div>
        <div className="code2-editor-container">
          <CodeMirror
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




/*{
        "1.325": "function sum ( array ) {\n\n}\n\nconsole.log(sum([1,2,3]));",
        "1.576": "function sum ( array ) {\n \n}\n\nconsole.log(sum([1,2,3]));",
        "2.923":
          "function sum ( array ) {\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "3.176":
          "function sum ( array ) {\n  v\n}\n\nconsole.log(sum([1,2,3]));",
        "3.443":
          "function sum ( array ) {\n  var\n}\n\nconsole.log(sum([1,2,3]));",
        "3.728":
          "function sum ( array ) {\n  var su\n}\n\nconsole.log(sum([1,2,3]));",
        "3.978":
          "function sum ( array ) {\n  var sum =\n}\n\nconsole.log(sum([1,2,3]));",
        "4.231":
          "function sum ( array ) {\n  var sum = \n}\n\nconsole.log(sum([1,2,3]));",
        "4.551":
          "function sum ( array ) {\n  var sum = 0\n}\n\nconsole.log(sum([1,2,3]));",
        "4.576":
          "function sum ( array ) {\n  var sum = 0;\n}\n\nconsole.log(sum([1,2,3]));",
        "4.831":
          "function sum ( array ) {\n  var sum = 0;\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "5.982":
          "function sum ( array ) {\n  var sum = 0;\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "6.234":
          "function sum ( array ) {\n  var sum = 0;\n  a\n}\n\nconsole.log(sum([1,2,3]));",
        "6.484":
          "function sum ( array ) {\n  var sum = 0;\n  arr\n}\n\nconsole.log(sum([1,2,3]));",
        "6.927":
          "function sum ( array ) {\n  var sum = 0;\n  array.\n}\n\nconsole.log(sum([1,2,3]));",
        "7.416":
          "function sum ( array ) {\n  var sum = 0;\n  array.F\n}\n\nconsole.log(sum([1,2,3]));",
        "7.667":
          "function sum ( array ) {\n  var sum = 0;\n  array.\n}\n\nconsole.log(sum([1,2,3]));",
        "7.984":
          "function sum ( array ) {\n  var sum = 0;\n  array.fo\n}\n\nconsole.log(sum([1,2,3]));",
        "8.143":
          "function sum ( array ) {\n  var sum = 0;\n  array.for\n}\n\nconsole.log(sum([1,2,3]));",
        "8.394":
          "function sum ( array ) {\n  var sum = 0;\n  array.forE\n}\n\nconsole.log(sum([1,2,3]));",
        "8.649":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEac\n}\n\nconsole.log(sum([1,2,3]));",
        "8.904":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach\n}\n\nconsole.log(sum([1,2,3]));",
        "9.519":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach(\n}\n\nconsole.log(sum([1,2,3]));",
        "9.77":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( \n}\n\nconsole.log(sum([1,2,3]));",
        "10.018":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el\n}\n\nconsole.log(sum([1,2,3]));",
        "10.334":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el=\n}\n\nconsole.log(sum([1,2,3]));",
        "10.586":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el\n}\n\nconsole.log(sum([1,2,3]));",
        "10.813":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el =\n}\n\nconsole.log(sum([1,2,3]));",
        "11.065":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el =>\n}\n\nconsole.log(sum([1,2,3]));",
        "11.44":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => \n}\n\nconsole.log(sum([1,2,3]));",
        "11.948":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n}\n\nconsole.log(sum([1,2,3]));",
        "12.201":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "12.218":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "12.471":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n  \n  \n}\n\nconsole.log(sum([1,2,3]));",
        "13.117":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n  \n  }\n}\n\nconsole.log(sum([1,2,3]));",
        "14.179":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n  \n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "14.43":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n   \n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "14.7":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    \n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "14.955":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    su\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "15.208":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "15.279":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum \n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "15.532":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum +\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "15.807":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum +=\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "16.334":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += \n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "16.585":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += e\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "16.837":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "17.723":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n}\n\nconsole.log(sum([1,2,3]));",
        "17.975":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "18.132":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  \n}\n\nconsole.log(sum([1,2,3]));",
        "18.384":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  r\n}\n\nconsole.log(sum([1,2,3]));",
        "18.641":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  ret\n}\n\nconsole.log(sum([1,2,3]));",
        "18.892":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  return \n}\n\nconsole.log(sum([1,2,3]));",
        "19.144":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  return su\n}\n\nconsole.log(sum([1,2,3]));",
        "19.317":
          "function sum ( array ) {\n  var sum = 0;\n  array.forEach( el => {\n    sum += el;\n  })\n  return sum\n}\n\nconsole.log(sum([1,2,3]));"
      }*/