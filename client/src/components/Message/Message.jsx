import React, { Component } from 'react';
import CodeMirror from 'react-codemirror2';
import io from 'socket.io-client/dist/socket.io.js';
import axios from 'axios';
import { throttle } from 'lodash';

import Stdout from '../Sling/StdOut/index.jsx';
import EditorHeader from '../Sling/EditorHeader';
import Button from '../globals/Button';

import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import '../Sling/Sling.css';

class Message extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      ownerText: null,
      challengerText: null,
      text: ['CHAT'],
      challenge: '',
      stdout: ''
    }
  }

  componentDidMount() {
    const { socket, challenge } = this.props;

    socket.on('server.message', ({ message, email }) => {
        const ownerEmail = localStorage.getItem('email');
        if (email === ownerEmail) {
            message = 'Me' + ' : ' + message; 
        } else {
            message = 'Them' + ' : ' + message; 
        }
        let text = this.state.text; 
        text.push(message); 
        this.setState({ text: text});
    });

    window.addEventListener('resize', this.setEditorSize);
  }

  render() {
    const { socket } = this.props;
    return (
      <div>
        <div className="message1-editor-container">
          <div>{this.state.text.map((line) => {
              return <div>{line}</div>
          })}</div>
        </div>
      </div>
    )
  }
}

export default Message;
