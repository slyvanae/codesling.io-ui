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

class MessageBox extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      ownerText: null,
      challengerText: null,
      text: 'Type your message here',
      challenge: '',
      stdout: ''
    }
  }

  componentDidMount() {
    const { socket, challenge } = this.props;
    window.addEventListener('resize', this.setEditorSize);
  }

  handleSubmit = throttle((editor, metadata) => {
    const email = localStorage.getItem('email');
    this.props.socket.emit('client.message', { message: this.state.text, email });
  }, 250)

  handleChange = throttle((editor, metadata, value) => {
    this.setState({
        text: value
    })
  }, 250)


  setEditorSize = throttle(() => {
    this.editor.setSize(null, `${window.innerHeight - 80}px`);
  }, 70);

  initializeEditor = (editor) => {
    this.editor = editor;
    this.setEditorSize();
  }

  render() {
    const { socket } = this.props;
    return (
        <div>
          <CodeMirror
            className="textbox"
            editorDidMount={this.initializeEditor}
            value={this.state.text}
            options={{
              mode: 'javascript',
              theme: 'base16-dark',
            }}
            onChange={this.handleChange}
            />
            <Button className="run-btn" 
            text="Send"
            backgroundColor="red"
            color="white"
            onClick={this.handleSubmit}
            />
        </div>
    )
  }
}

export default MessageBox;
