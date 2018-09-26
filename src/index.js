import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css';

var destination = document.querySelector("#container")

//basically, this renders a react element into the DOM in the supplied
//container and returns a reference to the component. If previously rendered
//in the container, this will make an update on it and change the DOM as necessary to
//reflect the latest changes. This makes a copy of everything and checks it with 
//updates. Like a web cache.
ReactDOM.render(
  <App />,
  document.getElementById('root')
);




