import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
    componentWillMount() {
    }
    render() {
        var testStyle = {
            display: 'none'
        }
        return (
            <div id="container" className="black container-fluid">
                <div className="workspace">
                    <div id="countdown">
                        <img src="http://www.adhd-assist.com/wp-content/uploads/2015/05/logo4.jpg" alt="ADHD Assist" class="logo_standard"></img>
                    </div>
                    <span id="workspace-container" className="super-large-font">
                        &nbsp;
                    </span>
                    <div class="results" id="workspace-results"></div>
                    <div id="app-feedback"></div>
                </div>
                <div className="intro-text" id="test-instructions">
                    <p>
                        <strong>Welcome to Focusmeter!</strong>
                    </p>
                    <p>It is <span id="target-minutes-placeholder"></span> minutes challenge.</p>
                    <p>Only click ONCE when number "1" is either spoken or appears on the screen.</p>
                    <p>Do not click when number "2" is either spoken or appears on the screen.</p>
                </div>
                <div className="actions">
                    <button type="button" className="btn btn-info btn-lg" id="start-test-button">
                        Start Test
            </button>
                    <a className="btn btn-default btn-lg" href="">
                        Go Back
            </a>
                </div>
                <div id="additional-controls">
                    <audio src="focus_hyperactivity_4/1.mp3" id="sound-1" type="audio/mpeg"></audio>
                    <audio src="focus_hyperactivity_4/2.mp3" id="sound-2" type="audio/mpeg" ></audio >
                </div >
                <div id="test-progress" style={{ display: "none" }}>
                    <h3> Test Progress :</h3>
                </div>
            </div >
        );
    }
}
render(<App />, document.getElementById('app'));