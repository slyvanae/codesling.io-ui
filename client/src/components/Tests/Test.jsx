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

class Test extends Component {
  constructor() {
      super(); 
      this.clearInput = this.clearInput.bind(this); 
  }
  clearInput() {
    this.refs.input.value=""; 
    this.refs.output.value=""; 
    this.props.addTestCase(); 
  }

  render() {
    return (
      <div>
        Test Cases: 
        <div> Input: <input  ref="input" onChange={this.props.handleInputChange}/> </div>
        <div> Output: <input ref="output" onChange={this.props.handleOutputChange}/> </div>
        <Button
        className="run-btn"
        text="Add Test Case"
        backgroundColor="red"
        color="white"
        onClick={this.clearInput}
        />
      </div>
    )
  }
}

export default Test;
